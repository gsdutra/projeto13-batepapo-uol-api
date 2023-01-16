# UOL Chat API

## GET Requests:

- /participants<br/>
Retrieves a list of all participants currently in the chat room from the MongoDB database. It returns a 200 status code and the list of participants if successful.<br/>body:
<pre>[
	{
	"_id": "63c4b2e615a77ce087eba985",
	"name": "USERNAME",
	"lastStatus": 1673835238795
	}
]
</pre>
<br/>

- /messages<br/>
Retrieves a list of all messages in the chat room. It accepts a query parameter "limit" that can be used to limit the number of messages returned. It also checks the headers for a "user" field and filters the messages based on whether they were sent to or from that user. It returns a 200 status code and the list of messages if successful.
<br/>body:
<pre>[
  {
    "_id": "63c465bceb5c4fd30dcdf314",
    "from": "Sisnei",
    "to": "Todos",
    "text": "entra na sala...",
    "type": "status",
    "time": "17:44:44"
  },
]
</pre>
## POST Requests:
- /participants<br/>
Adds a new participant to the chat room. It accepts a JSON object containing a "name" field in the request body. It uses the Joi library to validate that the name field is a string and is required. If the validation fails, it returns a 422 status code with error details. If the validation is successful, it checks if the participant already exists in the database and returns a 409 status code if they do. If the participant does not already exist, it adds the new participant to the database and sends a message to the chat room announcing their arrival.<br/>
body:<br/>
<pre>
{
    "name": "João"
}
</pre>
<br/>

- /messages<br/>
Allows a user to send a message to the chat room. It requieres the user name in the header tag "User". The user must be registered and active.<br/>
body:<br/>
<pre>
{
    "to": "Maria",
    "text": "Hello",
    "type": "private_message"
}
</pre>
<br/>

- /status<br/>
Allows a user to update their status on the chat room, preventing from disconnection.

<br/>