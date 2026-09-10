import pytest
import json


BASE = 10**18
CHALLENGE = 5 * 10**17


def _fund_contract(vm, amount):
    vm.deal(vm._contract_address, amount)
    vm.value = amount


def test_deploy_config_and_create_claim(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/SureLayer.py")
    assert contract.get_config()[:2] == (BASE, CHALLENGE)
    assert contract.get_protocol_stats()[:3] == (0, 0, 0)

    direct_vm.sender = direct_alice
    _fund_contract(direct_vm, BASE)
    claim_id = contract.create_claim(
        "The report uses only primary sources.",
        "https://example.test/report",
        "sha256:abc",
        "Every cited source is a primary source supporting the report.",
        ["https://example.test/source"],
    )

    claim = contract.get_claim(claim_id)
    assert claim[0] == claim_id
    from genlayer.py.types import Address

    assert claim[1] == str(Address(direct_alice))
    assert claim[9] == 1
    assert claim[6] == BASE
    assert contract.get_protocol_stats()[1] == BASE


def test_create_rejects_insufficient_bond(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/SureLayer.py")
    direct_vm.value = BASE - 1
    direct_vm.deal(direct_vm._contract_address, BASE - 1)
    with pytest.raises(Exception, match="below the configured minimum"):
        contract.create_claim("A claim", "", "", "A criterion", [])


@pytest.mark.parametrize("amount", [0, 1, BASE - 1])
def test_claim_bond_exact_wei_boundary_rejects_insufficient_values(
    direct_vm, direct_deploy, amount
):
    contract = direct_deploy("contracts/SureLayer.py")
    direct_vm.value = amount
    direct_vm.deal(direct_vm._contract_address, amount)
    with pytest.raises(Exception, match="below the configured minimum"):
        contract.create_claim("A claim", "", "", "A criterion", [])


def test_claim_bond_exactly_one_gen_is_accepted(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/SureLayer.py")
    direct_vm.sender = direct_alice
    direct_vm.value = BASE
    direct_vm.deal(direct_vm._contract_address, BASE)
    claim_id = contract.create_claim("A claim", "", "", "A criterion", [])
    assert claim_id == 1
    assert contract.get_claim(claim_id)[6] == BASE


def test_challenge_bond_exact_wei_boundary(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)

    direct_vm.sender = direct_bob
    direct_vm.value = CHALLENGE - 1
    direct_vm.deal(direct_vm._contract_address, BASE + CHALLENGE - 1)
    with pytest.raises(Exception, match="must equal"):
        contract.challenge_claim(claim_id, "reason", [])

    direct_vm.value = CHALLENGE
    direct_vm.deal(direct_vm._contract_address, BASE + CHALLENGE)
    contract.challenge_claim(claim_id, "reason", [])
    claim = contract.get_claim(claim_id)
    assert claim[9] == 2
    assert claim[12] == CHALLENGE


def test_issuer_cannot_self_challenge_or_create_challenge_liability(
    direct_vm, direct_deploy, direct_alice
):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)
    direct_vm.sender = direct_alice
    direct_vm.value = CHALLENGE
    direct_vm.deal(direct_vm._contract_address, BASE + CHALLENGE)

    with pytest.raises(Exception, match="issuer cannot challenge"):
        contract.challenge_claim(claim_id, "self challenge", [])

    claim = contract.get_claim(claim_id)
    assert claim[9] == 1
    assert claim[10] == ""
    assert claim[12] == 0
    assert contract.get_protocol_stats()[1:3] == (BASE, 0)


def test_bounds_and_url_validation(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/SureLayer.py")
    direct_vm.value = BASE
    direct_vm.deal(direct_vm._contract_address, BASE)
    with pytest.raises(Exception, match="claim statement"):
        contract.create_claim("", "", "", "A criterion", [])
    with pytest.raises(Exception, match="source URL"):
        contract.create_claim("A claim", "", "", "A criterion", ["ftp://example.test/source"])
    with pytest.raises(Exception, match="at most"):
        contract.create_claim(
            "A claim",
            "",
            "",
            "A criterion",
            [f"https://example.test/{i}" for i in range(5)],
        )


def test_duplicate_source_urls_are_rejected(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/SureLayer.py")
    direct_vm.sender = direct_alice
    direct_vm.value = BASE
    direct_vm.deal(direct_vm._contract_address, BASE)
    source = "https://example.test/source"
    with pytest.raises(Exception, match="duplicate source URL"):
        contract.create_claim("A claim", "", "", "A criterion", [source, source])

    claim_id = _create_claim(contract, direct_vm, direct_alice)
    direct_vm.sender = direct_bob
    direct_vm.value = CHALLENGE
    direct_vm.deal(direct_vm._contract_address, BASE + CHALLENGE)
    with pytest.raises(Exception, match="duplicate source URL"):
        contract.challenge_claim(claim_id, "duplicate evidence", [source, source])
    assert contract.get_claim(claim_id)[9] == 1
    assert contract.get_protocol_stats()[1:3] == (BASE, 0)


@pytest.mark.parametrize(
    "source",
    [
        "http://localhost:8080/private",
        "http://127.0.0.1:8080/private",
        "http://10.0.0.1/metadata",
        "http://192.168.1.1/admin",
        "http://[::1]/private",
        "http://user:pass@example.test/source",
        "https://ｅxample.test/source",
        "https://example.test/line\nfeed",
        "https://2130706433/private",
    ],
)
def test_rejects_private_or_credential_bearing_evidence_urls(direct_vm, direct_deploy, source):
    contract = direct_deploy("contracts/SureLayer.py")
    direct_vm.value = BASE
    direct_vm.deal(direct_vm._contract_address, BASE)
    with pytest.raises(Exception, match="source URL"):
        contract.create_claim("A claim", "", "", "A criterion", [source])


def _create_claim(contract, vm, issuer, amount=BASE):
    vm.warp("2026-09-08T00:00:00Z")
    vm.sender = issuer
    vm.value = amount
    current = vm._balances.get(vm._contract_address, 0)
    vm.deal(vm._contract_address, current + amount)
    return contract.create_claim(
        "The report uses only primary sources.",
        "https://example.test/report",
        "sha256:abc",
        "Every cited source is a primary source supporting the report.",
        ["https://example.test/issuer"],
    )


def _challenge_claim(contract, vm, claim_id, challenger):
    vm.sender = challenger
    vm.value = CHALLENGE
    current = vm._balances.get(vm._contract_address, 0)
    vm.deal(vm._contract_address, current + CHALLENGE)
    contract.challenge_claim(
        claim_id,
        "The cited evidence does not support the primary-source criterion.",
        ["https://example.test/challenger"],
    )


def test_challenge_and_supported_settlement(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)
    _challenge_claim(contract, direct_vm, claim_id, direct_bob)

    direct_vm.mock_web("example\\.test/(issuer|challenger)", {"status": 200, "body": "Primary source confirms the report."})
    direct_vm.mock_llm(
        "evidence adjudicator",
        json.dumps(
            {
                "verdict": "SUPPORTED",
                "evidence_state": "AVAILABLE",
                "criteria_met": True,
                "supporting_source_count": 2,
                "summary": "Both bounded sources support the criterion.",
            }
        ),
    )

    result = contract.resolve_claim(claim_id)
    assert result == "SUPPORTED"
    assert direct_vm.run_validator() is True
    assert direct_vm.run_validator(
        leader_result={
            "verdict": "BREACHED",
            "evidence_state": "AVAILABLE",
            "criteria_met": False,
            "supporting_source_count": 0,
            "summary": "Malicious leader output.",
        }
    ) is False

    assert contract.get_credit(str(contract.get_claim(claim_id)[1])) == BASE + CHALLENGE
    assert contract.get_protocol_stats()[1:3] == (0, BASE + CHALLENGE)

    direct_vm.sender = direct_alice
    direct_vm.value = 0
    assert contract.withdraw_credit() == BASE + CHALLENGE
    assert contract.get_my_credit() == 0
    with pytest.raises(Exception, match="no credit"):
        contract.withdraw_credit()


def test_challenge_and_timeout_recovery(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)
    _challenge_claim(contract, direct_vm, claim_id, direct_bob)
    direct_vm.warp("2026-09-08T23:59:59Z")
    with pytest.raises(Exception, match="timeout"):
        contract.recover_challenge_timeout(claim_id)
    direct_vm.warp("2026-09-09T00:00:01Z")
    direct_vm.sender = direct_bob
    direct_vm.value = 0
    direct_vm.deal(direct_vm._contract_address, BASE + CHALLENGE)
    contract.recover_challenge_timeout(claim_id)
    assert contract.get_claim(claim_id)[9] == 7
    assert contract.get_credit(str(contract.get_claim(claim_id)[1])) == BASE
    assert contract.get_credit(str(contract.get_claim(claim_id)[10])) == CHALLENGE
    with pytest.raises(Exception, match="not awaiting"):
        contract.recover_challenge_timeout(claim_id)


def test_timeout_recovery_is_allowed_at_exact_deadline(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)
    _challenge_claim(contract, direct_vm, claim_id, direct_bob)
    direct_vm.warp("2026-09-09T00:00:00Z")
    direct_vm.sender = direct_bob
    direct_vm.value = 0
    contract.recover_challenge_timeout(claim_id)
    claim = contract.get_claim(claim_id)
    assert claim[9] == 7
    assert claim[20] == claim[14]
    assert contract.get_protocol_stats()[1:3] == (0, BASE + CHALLENGE)


def test_unchallenged_finalization_and_pagination(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)
    with pytest.raises(Exception, match="still open"):
        contract.finalize_unchallenged(claim_id)
    direct_vm.warp("2026-09-10T00:00:00Z")
    direct_vm.sender = b"\x02" * 20
    direct_vm.value = 0
    with pytest.raises(Exception, match="only the issuer"):
        contract.finalize_unchallenged(claim_id)
    direct_vm.sender = direct_alice
    direct_vm.value = 0
    direct_vm.deal(direct_vm._contract_address, BASE)
    contract.finalize_unchallenged(claim_id)
    assert contract.get_claim(claim_id)[9] == 6
    assert contract.get_credit(str(contract.get_claim(claim_id)[1])) == BASE
    with pytest.raises(Exception, match="not unchallenged"):
        contract.finalize_unchallenged(claim_id)
    assert contract.list_claims(0, 25)[0][0] == claim_id
    assert contract.list_claims(99, 25) == []
    with pytest.raises(Exception, match="page size"):
        contract.list_claims(0, 26)


def test_breached_and_inconclusive_economic_outcomes(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/SureLayer.py")
    first = _create_claim(contract, direct_vm, direct_alice)
    _challenge_claim(contract, direct_vm, first, direct_bob)
    direct_vm.mock_web("example\\.test/(issuer|challenger)", {"status": 200, "body": "Source"})
    direct_vm.mock_llm(
        "evidence adjudicator",
        json.dumps(
            {
                "verdict": "BREACHED",
                "evidence_state": "AVAILABLE",
                "criteria_met": False,
                "supporting_source_count": 2,
                "summary": "A source reliably contradicts the criterion.",
            }
        ),
    )
    assert contract.resolve_claim(first) == "BREACHED"
    first_claim = contract.get_claim(first)
    assert contract.get_credit(first_claim[10]) == BASE + CHALLENGE
    assert contract.get_credit(first_claim[1]) == 0

    direct_vm.clear_mocks()
    second = _create_claim(contract, direct_vm, direct_alice)
    _challenge_claim(contract, direct_vm, second, direct_bob)
    direct_vm.mock_web("example\\.test/(issuer|challenger)", {"status": 200, "body": "Source"})
    direct_vm.mock_llm(
        "evidence adjudicator",
        json.dumps(
            {
                "verdict": "INCONCLUSIVE",
                "evidence_state": "CONTRADICTORY",
                "criteria_met": False,
                "supporting_source_count": 1,
                "summary": "The bounded sources conflict.",
            }
        ),
    )
    assert contract.resolve_claim(second) == "INCONCLUSIVE"
    second_claim = contract.get_claim(second)
    assert contract.get_credit(second_claim[1]) == BASE
    assert contract.get_credit(second_claim[10]) == BASE + 2 * CHALLENGE
    assert contract.get_protocol_stats()[1:3] == (0, 3 * BASE)


def test_challenge_guards_views_and_deadline_boundary(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)
    claim = contract.get_claim(claim_id)
    assert contract.state_name(claim[9]) == "OPEN"
    assert contract.state_name(999) == "UNKNOWN"
    assert contract.get_claim_evidence(claim_id)[0] == ["https://example.test/issuer"]
    assert contract.get_claim_timeline(claim_id)[0][0] == "CREATED"
    direct_vm.sender = direct_bob
    direct_vm.value = 1
    with pytest.raises(Exception, match="must equal"):
        contract.challenge_claim(claim_id, "reason", [])

    direct_vm.sender = direct_alice
    direct_vm.value = CHALLENGE
    with pytest.raises(Exception, match="issuer cannot"):
        contract.challenge_claim(claim_id, "reason", [])
    direct_vm.warp("2026-09-09T00:00:00Z")
    direct_vm.value = CHALLENGE
    with pytest.raises(Exception, match="closed"):
        contract.challenge_claim(claim_id, "reason", [])
    direct_vm.sender = direct_alice
    direct_vm.value = 0
    contract.finalize_unchallenged(claim_id)
    assert contract.get_claim_timeline(claim_id)[-1] == (
        "UNCHALLENGED_FINALIZED",
        contract.get_claim(claim_id)[20],
        contract.get_claim(claim_id)[1],
    )
    with pytest.raises(Exception, match="unknown claim"):
        contract.get_claim(99)
    with pytest.raises(Exception, match="unknown claim"):
        contract.get_claim_evidence(99)


def test_maximum_unicode_inputs_and_duplicate_challenge_are_bounded(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/SureLayer.py")
    direct_vm.warp("2026-09-08T00:00:00Z")
    direct_vm.sender = direct_alice
    direct_vm.value = BASE
    direct_vm.deal(direct_vm._contract_address, BASE)
    statement = "界" * 1200
    criteria = "✓" * 2000
    sources = [f"https://example.test/source-{index}" for index in range(4)]
    claim_id = contract.create_claim(statement, "x" * 500, "h" * 128, criteria, sources)
    assert contract.get_claim(claim_id)[2] == statement
    assert contract.get_claim_evidence(claim_id)[0] == sources

    direct_vm.sender = direct_bob
    direct_vm.value = CHALLENGE
    direct_vm.deal(direct_vm._contract_address, BASE + CHALLENGE)
    contract.challenge_claim(claim_id, "理由" * 400, sources)
    with pytest.raises(Exception, match="not open"):
        contract.challenge_claim(claim_id, "duplicate", [])


def test_terminal_guards_unknown_timeline_and_unauthorized_withdrawal(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)
    _challenge_claim(contract, direct_vm, claim_id, direct_bob)
    direct_vm.mock_web("example\\.test/(issuer|challenger)", {"status": 200, "body": "Source"})
    direct_vm.mock_llm(
        "evidence adjudicator",
        json.dumps(
            {
                "verdict": "SUPPORTED",
                "evidence_state": "AVAILABLE",
                "criteria_met": True,
                "supporting_source_count": 2,
                "summary": "Both bounded sources support the criterion.",
            }
        ),
    )
    assert contract.resolve_claim(claim_id) == "SUPPORTED"
    assert contract.get_claim_timeline(claim_id)[-1][2] == "consensus"
    with pytest.raises(Exception, match="not challenged"):
        contract.resolve_claim(claim_id)
    with pytest.raises(Exception, match="not unchallenged"):
        contract.finalize_unchallenged(claim_id)
    direct_vm.sender = direct_bob
    direct_vm.value = 0
    with pytest.raises(Exception, match="no credit"):
        contract.withdraw_credit()
    with pytest.raises(Exception, match="unknown claim"):
        contract.get_claim_timeline(99)


def test_timeout_timeline_is_permissionless_not_consensus(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = direct_deploy("contracts/SureLayer.py")
    claim_id = _create_claim(contract, direct_vm, direct_alice)
    _challenge_claim(contract, direct_vm, claim_id, direct_bob)
    direct_vm.warp("2026-09-10T00:00:00Z")
    contract.recover_challenge_timeout(claim_id)
    claim = contract.get_claim(claim_id)
    assert contract.get_claim_timeline(claim_id)[-1] == (
        "TIMEOUT_RECOVERED",
        claim[20],
        "permissionless",
    )
