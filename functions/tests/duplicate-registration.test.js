'use strict';

// Tests the duplicate registration guard in createCheckoutSession.
// We isolate the guard logic by extracting it from the handler — the handler
// returns 409 when attendees/{uid} already has paid:true.

const assert = require('assert');

// Simulate the guard that lives in createCheckoutSession (lines ~114-122)
async function checkDuplicateRegistration(db, sessionId, uid) {
  const [sessionSnap, attendeeSnap] = await Promise.all([
    db.collection('sessions').doc(sessionId).get(),
    db.collection('sessions').doc(sessionId).collection('attendees').doc(uid).get(),
  ]);

  if (!sessionSnap.exists) return { status: 404, error: 'Session not found.' };
  if (attendeeSnap.exists && attendeeSnap.data().paid) {
    return { status: 409, error: 'Already registered and paid.' };
  }
  return { status: 200 };
}

function makeDb({ sessionExists = true, attendeePaid = false } = {}) {
  return {
    collection: () => ({
      doc: (id) => ({
        get: async () => ({
          exists: id === 'session1' ? sessionExists : attendeePaid,
          data:   () => id === 'session1' ? { cost: 10 } : { paid: attendeePaid },
        }),
        collection: () => ({
          doc: () => ({
            get: async () => ({
              exists: attendeePaid,
              data:   () => ({ paid: attendeePaid }),
            }),
          }),
        }),
      }),
    }),
  };
}

describe('duplicate registration guard', () => {
  test('returns 409 when attendee already has paid:true', async () => {
    const db = makeDb({ sessionExists: true, attendeePaid: true });
    const result = await checkDuplicateRegistration(db, 'session1', 'uid1');
    expect(result.status).toBe(409);
    expect(result.error).toMatch(/already registered/i);
  });

  test('returns 200 when attendee does not exist', async () => {
    const db = makeDb({ sessionExists: true, attendeePaid: false });
    const result = await checkDuplicateRegistration(db, 'session1', 'uid1');
    expect(result.status).toBe(200);
  });

  test('returns 404 when session does not exist', async () => {
    const db = makeDb({ sessionExists: false, attendeePaid: false });
    const result = await checkDuplicateRegistration(db, 'session1', 'uid1');
    expect(result.status).toBe(404);
  });
});
