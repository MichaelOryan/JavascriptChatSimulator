# JavascriptChatSimulator

Simulate a chat on a html page

# Basic Usage

Create instance of MessageText

messageText = new MessageText();

# Add Message to queue.

messageText.addMessage("Name", "Message Content", Type);

# Add portrait

messageText.addPortrait("Name", "./src/images/url/image.jpg");

Type can be messageText.Type.Text or messageText.Type.Image

Default css classes are.

Name - ["message-name"]

Portrait - ["message-portrait", "img-circle"]

Each message Div including plain text - ["message-div", "well", "col-lg-12"]

# Advanced

# Message Queue Handling

MessageText.prototype.addMessage = function(name, message, type, options)

name - speaker name
message - content of message. Text or Url
type MessageText.Type.Text or MessageText.Type.Image
options

StartCallback: Function to run before message beings but div is created
FinishCallback: Function to run when message finishes but before next div is created

callback(options)

options = {
    target: "#target_div_id_of_message",
    message: {
        Contains what is documented here for this particular message.
        ie; StartCallback: function
        FinishCallback: function
        CharacterInterval: time_in_ms
    }
}

CharacterInterval: Time in milliseconds between each new character
RandomizeCharacterIntervalOn: Should the time be random. between 0 and CharacterInterval
MessageInterval: Time between this message and the next one
RandomizeMessageInterval: Should the time be random. Between 0 and MessageInterval
DivClasses: Classes for the div containing the message
ImageClasses: Classes for the image in the message
PortraitClasses: Classes for the portait in the message
NameClasses: Classes for the name. May not be used?

All classes should be as an array. ie; ["class1", "class2", "class3"]

MessageText.prototype.popMessages = function()
Remove from and return the last message in the queue.

MessageText.prototype.shiftMessages = function()
Remove from and return the first message in the queue.

MessageText.prototype.isEmptyMessages() = function()
Are there any messages stored in the MessageText object

# Portraits

MessageText.prototype.addPortrait = function(name, url)

Add a portrait for a specific name. One per name.

MessageText.prototype.removePortait = function(name)

Remove a portrait for a specific name.
