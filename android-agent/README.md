# Watchtower Android Agent

The Android agent is the lightweight device-side companion for Watchtower Core.

## Design goals

- Observe only data Android and the user explicitly permit the app to access.
- Keep collection minimal and explainable.
- Never collect passwords, message contents, private account credentials, or bypass Android security controls.
- Queue signed event envelopes locally and synchronize them to the Watchtower API when connectivity is available.
- Make collection categories and permissions visible to the user.

## Planned MVP telemetry

- App/package inventory and changes, subject to Android platform/API restrictions.
- Runtime permission state changes that the app is permitted to observe.
- Device security and connectivity state exposed by public Android APIs.
- Battery/storage/network availability needed for reliable synchronization.
- Local Watchtower agent health and synchronization status.

## Architecture

`Android Agent -> local event queue -> authenticated Watchtower API -> exposure/event pipeline -> dashboard`

The agent must not be treated as a surveillance tool. A server-side record is created only from an authorized device session and an event that the Android agent can legitimately observe.

## Current status

This directory establishes the Android companion boundary and implementation plan. Native Android implementation, device enrollment, authenticated synchronization, WorkManager scheduling, and release packaging remain to be implemented and verified on physical Android devices.
