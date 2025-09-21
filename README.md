## Security Issue

- used directly `PublicKey` and `AssistantID` from .env
- User can fill form of setting and get access for Voice AI create
- Form handled on client side, need to be store in DB and the fetch on server side components

1. Ask desired date & time. 
2. then → collect name, email, phone.  
4. Confirm letter by letter spelling of email & phone.  
5. Send all info to n8n → wait for tool_results.  
6. Repeat exact word 'send_appointment' tool response to the client.  