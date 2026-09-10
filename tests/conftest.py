"""Compatibility bridge for genlayer-test 0.30.0rc2's v0.3 SDK layout.

The released direct loader still imports ``genlayer.calldata`` while the
current runner exposes it under ``genlayer.py.calldata``. Without this bridge
the loader injects an empty stdin message before importing any contract.
"""

import os
import tempfile

import pytest

from gltest.direct import loader
from gltest.direct import sdk_compat, wasi_mock


def _current_calldata():
    from genlayer.py import calldata

    return calldata


sdk_compat.import_calldata = _current_calldata
loader.import_calldata = _current_calldata
wasi_mock.import_calldata = _current_calldata


def _inject_current_message(vm):
    from genlayer.py import calldata
    from genlayer.py.types import Address

    sender = vm.sender
    if isinstance(sender, bytes):
        sender = Address(sender)
    contract = vm._contract_address
    if isinstance(contract, bytes):
        contract = Address(contract)
    origin = vm.origin
    if isinstance(origin, bytes):
        origin = Address(origin)

    payload = calldata.encode(
        {
            "contract_address": contract,
            "sender_address": sender,
            "origin_address": origin,
            "stack": [],
            "value": vm._value,
            "datetime": vm._datetime,
            "is_init": False,
            "chain_id": vm._chain_id,
            "entry_kind": 0,
            "entry_data": b"",
            "entry_stage_data": None,
        }
    )
    fd, path = tempfile.mkstemp()
    try:
        os.write(fd, payload)
        os.lseek(fd, 0, os.SEEK_SET)
        vm._original_stdin_fd = os.dup(0)
        os.dup2(fd, 0)
    finally:
        os.close(fd)
        os.unlink(path)


loader._inject_message_to_fd0 = _inject_current_message


def _allocate_current(contract_cls, vm, *args, **kwargs):
    from genlayer.py.storage import ROOT_SLOT_ID
    from genlayer.py.storage._internal.generate import (
        ORIGINAL_INIT_ATTR,
        Lit,
        _storage_build,
    )

    descriptor = _storage_build(contract_cls, {})
    if isinstance(descriptor, Lit):
        raise TypeError("contract did not produce a storage descriptor")
    instance = descriptor.get(vm._storage.get_store_slot(ROOT_SLOT_ID), 0)
    init = getattr(descriptor, "cls", None) or contract_cls
    init = getattr(init, "__init__", None)
    if init is not None:
        init = getattr(init, ORIGINAL_INIT_ATTR, init)
        init(instance, *args, **kwargs)
    return instance


loader._allocate_contract = _allocate_current


def _patch_current_nondet():
    import genlayer.gl.vm as gl_vm

    if getattr(gl_vm, "_direct_mode_patched", False):
        return

    def run_direct(leader_fn, validator_fn, /, **kwargs):
        from gltest.direct import wasi_mock

        vm = wasi_mock.get_vm()
        vm._in_nondet = True
        try:
            result = leader_fn()
        finally:
            vm._in_nondet = False
        vm._captured_validators.append((result, leader_fn, validator_fn))
        return result

    gl_vm.run_nondet = run_direct
    gl_vm.run_nondet_unsafe = run_direct
    gl_vm._direct_mode_patched = True


loader._patch_run_nondet_for_direct_mode = _patch_current_nondet


from gltest.direct.vm import VMContext, _sentinel

_original_refresh = VMContext._refresh_gl_message


def _refresh_current_message(vm):
    _original_refresh(vm)
    import sys

    gl_module = sys.modules.get("genlayer.gl")
    if gl_module is None or not hasattr(gl_module, "MessageType"):
        return
    from genlayer.py.types import Address, u256

    sender = vm.sender
    if isinstance(sender, bytes):
        sender = Address(sender)
    origin = vm.origin
    if isinstance(origin, bytes):
        origin = Address(origin)
    raw = gl_module.message_raw
    raw["sender_address"] = sender
    raw["origin_address"] = origin
    raw["value"] = u256(vm._value)
    raw["chain_id"] = u256(vm._chain_id)
    gl_module.message = gl_module.MessageType(
        contract_address=raw["contract_address"],
        sender_address=sender,
        origin_address=origin,
        value=u256(vm._value),
        chain_id=u256(vm._chain_id),
    )


VMContext._refresh_gl_message = _refresh_current_message


def _run_validator_current(vm, *, leader_result=_sentinel, leader_error=None, index=-1):
    if not vm._captured_validators:
        raise RuntimeError("No validator captured")
    stored_result, _leader_fn, validator_fn = vm._captured_validators[index]
    import genlayer.gl.vm as gl_vm

    if leader_error is not None:
        wrapped = gl_vm.UserError(message=str(leader_error))
    elif leader_result is not _sentinel:
        wrapped = gl_vm.Return(calldata=leader_result)
    else:
        wrapped = gl_vm.Return(calldata=stored_result)
    return validator_fn(wrapped)


VMContext.run_validator = _run_validator_current


@pytest.fixture(autouse=True)
def enable_storage_pickling_validation(direct_vm):
    """Exercise the same storage-serialization guard used by GenLayer Direct Mode."""
    direct_vm.check_pickling = True
