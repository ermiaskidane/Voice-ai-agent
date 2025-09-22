## Security Issue

- used directly `PublicKey` and `AssistantID` from .env
- User can fill form of setting and get access for Voice AI create
- n8n API `https://<name>.app.n8n.cloud/webhook-test/<ID>` point is create with form fields. Better Alternative is to fetch from`.env` and assign to the `n8nWebhookUrl` without placing in the html Elements.

- utilizing Vapi-widget script always expose `PublicKey` and `AssistantID`
