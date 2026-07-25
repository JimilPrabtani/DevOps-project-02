# =============================================================================
# VPC
#
# BEFORE: three PUBLIC subnets with map_public_ip_on_launch = true, a single
# route table pointing at the internet gateway, and no security groups. Every
# worker node — running Postgres with customer data on an attached EBS volume —
# received a routable public IP address.
#
# AFTER: public subnets for load balancers only; worker nodes live in private
# subnets and reach the internet through a NAT gateway. Flow logs record
# traffic for incident investigation.
# =============================================================================

resource "aws_vpc" "vpc" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = var.vpc_name
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "${var.vpc_name}-igw"
  }
}

# -----------------------------------------------------------------------------
# Public subnets — internet-facing load balancers and the NAT gateway
# -----------------------------------------------------------------------------
resource "aws_subnet" "public" {
  count = length(var.subnet_cidrs)

  vpc_id            = aws_vpc.vpc.id
  cidr_block        = var.subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  # Load balancers need public IPs; nothing else is placed here.
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "${var.vpc_name}-public-${count.index + 1}"
    "kubernetes.io/role/elb"                    = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# -----------------------------------------------------------------------------
# Private subnets — worker nodes
# -----------------------------------------------------------------------------
resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.vpc.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  # The whole point: no public IP on any node.
  map_public_ip_on_launch = false

  tags = {
    Name                                        = "${var.vpc_name}-private-${count.index + 1}"
    "kubernetes.io/role/internal-elb"           = "1"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
}

# -----------------------------------------------------------------------------
# NAT gateway — outbound internet for private subnets
#
# COST WARNING: a NAT gateway is roughly $32/month plus data processing charges,
# and it is the single most expensive component of this stack when idle.
# `single_nat_gateway = true` (the default) uses one NAT for all AZs to keep the
# bill down; set it to false for production-grade AZ redundancy.
# -----------------------------------------------------------------------------
locals {
  nat_count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(aws_subnet.private)) : 0
}

resource "aws_eip" "nat" {
  count  = local.nat_count
  domain = "vpc"

  tags = {
    Name = "${var.vpc_name}-nat-eip-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_nat_gateway" "nat" {
  count = local.nat_count

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.vpc_name}-nat-${count.index + 1}"
  }

  depends_on = [aws_internet_gateway.igw]
}

# -----------------------------------------------------------------------------
# Routing
# -----------------------------------------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.vpc_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  count = length(aws_subnet.private)

  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "${var.vpc_name}-private-rt-${count.index + 1}"
  }
}

resource "aws_route" "private_nat" {
  count = var.enable_nat_gateway ? length(aws_route_table.private) : 0

  route_table_id         = aws_route_table.private[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat[var.single_nat_gateway ? 0 : count.index].id
}

resource "aws_route_table_association" "private" {
  count = length(aws_subnet.private)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# -----------------------------------------------------------------------------
# VPC Flow Logs
#
# Without these there is no record of network activity, which makes any
# incident investigation guesswork.
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "flow_logs" {
  count = var.enable_flow_logs ? 1 : 0

  name              = "/aws/vpc/${var.vpc_name}/flow-logs"
  retention_in_days = var.flow_logs_retention_days
}

data "aws_iam_policy_document" "flow_logs_assume" {
  count = var.enable_flow_logs ? 1 : 0

  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["vpc-flow-logs.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "flow_logs" {
  count = var.enable_flow_logs ? 1 : 0

  name               = "${var.vpc_name}-flow-logs-role"
  assume_role_policy = data.aws_iam_policy_document.flow_logs_assume[0].json
}

data "aws_iam_policy_document" "flow_logs" {
  count = var.enable_flow_logs ? 1 : 0

  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
    ]
    # Scoped to this log group rather than "*".
    resources = ["${aws_cloudwatch_log_group.flow_logs[0].arn}:*"]
  }
}

resource "aws_iam_role_policy" "flow_logs" {
  count = var.enable_flow_logs ? 1 : 0

  name   = "${var.vpc_name}-flow-logs-policy"
  role   = aws_iam_role.flow_logs[0].id
  policy = data.aws_iam_policy_document.flow_logs[0].json
}

resource "aws_flow_log" "vpc" {
  count = var.enable_flow_logs ? 1 : 0

  iam_role_arn    = aws_iam_role.flow_logs[0].arn
  log_destination = aws_cloudwatch_log_group.flow_logs[0].arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.vpc.id
}

# -----------------------------------------------------------------------------
# Default security group lockdown
#
# AWS creates a default SG allowing all traffic between attached resources.
# Anything that forgets to specify a security group silently lands here, so
# it is explicitly emptied.
# -----------------------------------------------------------------------------
resource "aws_default_security_group" "default" {
  vpc_id = aws_vpc.vpc.id

  # No ingress and no egress rules — deliberately empty.
  tags = {
    Name = "${var.vpc_name}-default-DO-NOT-USE"
  }
}
