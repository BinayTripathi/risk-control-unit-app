// Recording status callback from the <Dial> in /call. Uploads the finished recording with the call times to the API.

// shortcut: demo posts every call as this agent; for production pass the calling agent through from /call
const API_USERNAME = 'agent@checker.com';

const getBearerToken = async (apiBaseUrl) => {
  const res = await fetch(`${apiBaseUrl}/Secure/test-2-get-jwt-token?username=${encodeURIComponent(API_USERNAME)}`);
  if (!res.ok) throw new Error(`token request returned ${res.status}`);
  const { token } = await res.json();
  if (!token) throw new Error('token response had no token');
  return token;
};

// Recording media URLs need the account credentials when "HTTP auth for media" is on (the default)
const downloadRecording = async (context, recordingUrl) => {
  const auth = Buffer.from(`${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`).toString('base64');
  const res = await fetch(`${recordingUrl}.mp3`, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`recording download returned ${res.status}`);
  return new Blob([await res.arrayBuffer()], { type: 'audio/mpeg' });
};

const postCallRecord = async (apiBaseUrl, token, record) => {
  const query = new URLSearchParams({
    Id: '0', // the API assigns the real id
    CaseId: String(record.caseId),
    StartTime: record.startTime.toISOString(),
    Duration: String(record.duration),
    CallReceivedTime: record.callReceivedTime.toISOString(),
  });

  const form = new FormData();
  form.append('CallRecording', record.audio, record.fileName);

  const res = await fetch(`${apiBaseUrl}/Agent/call?${query}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Agent/call returned ${res.status}: ${await res.text()}`);
};

exports.handler = async (context, event, callback) => {
  if (event.RecordingStatus !== 'completed') return callback(null, {});

  try {
    // CallSid is the agent's leg, the call that ran the <Dial>
    const agentCall = await context.getTwilioClient().calls(event.CallSid).fetch();
    const audio = await downloadRecording(context, event.RecordingUrl);
    const token = await getBearerToken(context.API_BASE_URL);

    await postCallRecord(context.API_BASE_URL, token, {
      caseId: event.caseId,
      startTime: agentCall.startTime ?? agentCall.dateCreated,
      // Recording starts when the client answers, so its start and length are the answer time and talk time
      callReceivedTime: new Date(event.RecordingStartTime),
      duration: Number(event.RecordingDuration) || 0,
      audio,
      fileName: `${event.caseId}-${event.RecordingSid}.mp3`,
    });
    console.log(`posted call record for case ${event.caseId}: ${event.RecordingDuration}s, ${audio.size} bytes`);
    callback(null, {});
  } catch (err) {
    // The recording stays in Twilio (Monitor > Call Recordings), so a failed upload can be retried by hand
    console.error(err);
    callback(err);
  }
};
