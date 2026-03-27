import re

CANONICAL_PATTERN = re.compile(r"^[A-Z][A-Z0-9]{0,3}\.[A-Z][A-Z0-9]{0,7}\.[A-Z]{2,4}$")
DLQ_PREFIXES = ("DLQ.", "DEAD.", "DEADLETTER.")
XMIT_PREFIXES = ("XMIT.", "XMT.", "TX.")


def is_canonical_name(name: str) -> bool:
    """
    Check if an MQ object name follows the canonical DOMAIN.APP.DIRECTION schema.
    Example valid names: Q.BILLING.IN, Q.PAY.OUT, DLQ.BILLING
    TODO: Phase 7D — expand pattern to cover QM, channel, and alias naming rules
    """
    return bool(CANONICAL_PATTERN.match(name.upper()))


def is_dlq_name(name: str) -> bool:
    """Return True if the name looks like a dead-letter queue."""
    upper = name.upper()
    return any(upper.startswith(p) for p in DLQ_PREFIXES)


def is_transmission_channel(name: str) -> bool:
    """Return True if the name looks like a transmission channel."""
    upper = name.upper()
    return any(upper.startswith(p) for p in XMIT_PREFIXES)


def suggest_canonical_name(raw_name: str, object_type: str = "QUEUE") -> str:
    """
    Suggest a canonical replacement name for a non-conforming object name.
    TODO: Phase 7D — implement naming suggestion logic using object context
    """
    return raw_name.upper().replace(" ", "_").replace("-", ".")


def count_naming_violations(names: list[str]) -> int:
    """Return count of names that do not follow the canonical pattern."""
    return sum(1 for n in names if not is_canonical_name(n))
