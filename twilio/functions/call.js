// Accepts +61..., 04..., 4xxxxxxxx (9 digits, leading 0 dropped), or +6104... / +9109... (0 typed after the country code)
const toE164 = (raw) => (raw || '')
  .replace(/[^\d+]/g, '')
  .replace(/^(\d{9})$/, '+61$1')
  .replace(/^0/, '+61')
  .replace(/^\+(61|91|1)0/, '+$1');

const isPhone = (phone) => /^\+\d{8,15}$/.test(phone);

exports.handler = async (context, event, callback) => {
  const fail = (code, reason) => {
    const res = new Twilio.Response();
    res.setStatusCode(code);
    res.appendHeader('Content-Type', 'application/json');
    res.setBody(JSON.stringify({ error: reason }));
    console.log(`rejected ${code}: ${reason}`);
    return callback(null, res);
  };

  const agentPhone = toE164(event.from);
  const clientPhone = toE164(event.to);

  if (event.key !== context.DEMO_KEY) return fail(403, 'bad key');
  if (!event.caseId) return fail(400, 'missing caseId');
  if (!isPhone(agentPhone)) return fail(400, `bad agent phone: "${event.from}" -> "${agentPhone}"`);
  if (!isPhone(clientPhone)) return fail(400, `bad client phone: "${event.to}" -> "${clientPhone}"`);

  const client = context.getTwilioClient();

  // Records from when the client answers, one channel per side; /recording uploads it to the API once Twilio finishes the file
  const recordingUrl = `https://${context.DOMAIN_NAME}/recording?caseId=${encodeURIComponent(event.caseId)}`;

  const twiml = [
    '<Response>',
    '<Say>Connecting you</Say>',
    `<Dial callerId="${context.TWILIO_NUMBER}" record="record-from-answer-dual" recordingStatusCallback="${recordingUrl}" recordingStatusCallbackEvent="completed">`,
    `<Number>${clientPhone}</Number>`,
    '</Dial>',
    '</Response>',
  ].join('');

  try {
    await client.calls.create({ to: agentPhone, from: context.TWILIO_NUMBER, twiml });
  } catch (err) {
    return fail(500, `twilio error ${err.code}: ${err.message}`);
  }
  callback(null, { ok: true });
};
