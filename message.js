function MessageText(Options) {
    this.Messages = this.valueOrDefault(Options, "Messages", []); // May not be supported in future
    this.Target = this.valueOrDefault(Options, "Target", "");
    this.Type = {Text: 0, Image: 1};
    this.Portraits = this.valueOrDefault(Options, "Portraits", {}); // May not be supported in future
    this.PortraitClasses = this.valueOrDefault(Options, "PortraitClasses", ["message-portrait", "img-circle"]);
    this.SpeakerClasses = this.valueOrDefault(Options, "SpeakerClasses", ["message-name"]);
    this.MessageDivClasses = this.valueOrDefault(Options, "MessageDivClasses", ["message-div", "well", "col-lg-12"]);
    this.ImageClasses = this.valueOrDefault(Options, "ImageClasses", ["message-image"]);
    this.IsRemoveTopOverflow = this.valueOrDefault(Options, "IsRemoveTopOverflow", false);
    this.CharacterInterval = this.valueOrDefault(Options, "CharacterInterval", 100);
    this.MessageInterval = this.valueOrDefault(Options, "CharacterInterval", this.CharacterInterval * 50);
    this.RandomizeCharacterInterval = this.valueOrDefault(Options, "RandomizeCharacterInterval", true);
    this.RandomizeMessageInterval = this.valueOrDefault(Options, "RandomizeMessageInterval", true);
    this.NewDivForEachMessage = this.valueOrDefault(Options, "NewDivForEachMessage", true);
    this.IDPrefix = this.valueOrDefault(Options, "IDPrefix", "MessageText_");
}

MessageText.prototype.start = function(callback) {
    var Messages = {
        container: this.Target,
        targetDiv: 0,
        currentMessage: this.Messages[0],
        contentIndex: 0,
        allMessages: this.Messages,
        messageIndex: 0,
        callback: callback,
        oldestMessageIndex: 0
    };
    this.showText(Messages);
}

// To append a message to be sent
// Proper way of populating messages in class. Other ways may not be future supported
// In future may store messages differently
MessageText.prototype.addMessage = function(name, message, type, intervalOptions) {
    this.Messages.push(this.createMessageObject(name, message, type, intervalOptions));
}

MessageText.prototype.popMessages = function() {
    return this.Messages.pop();
}

MessageText.prototype.isEmptyMessages = function() {
    return this.Messages.length == 0;
}

// Pop front of Messages
MessageText.prototype.shiftMessages = function() {
    return this.Messages.shift();
}


// Set a portrait for a name
// Proper way of populating portraits in class. Other ways may not be future supported
// In future may store protraits differently
// Eg; names that cannot be used as a key in an object
MessageText.prototype.addPortrait = function(name, url) {
    this.Portraits[name] = url || "";
}

MessageText.prototype.removePortait = function(name) {
    const index = this.Portraits.indexOf(name);
    if(index != -1) {
        this.Portraits.splice(index, 1);
        return true;
    } else {
        return false;
    }

}

// May not be supported in future
MessageText.prototype.replacePortraits = function(portraits) {
    this.Portraits = portraits;
}
// May not be supported in future
MessageText.prototype.replaceMessages = function(messages) {
    this.Messages = messages
}

MessageText.prototype.newSpeaker = function(target, name) {
    
    var content = this.makePortraitTag(name) + name;
    var tag = this.makeSpeakerTag(content);
    
    $(target).append(tag);
    $(target).append("<p/>");
}

MessageText.prototype.isOverflow = function(Messages) {
    var container = Messages.container;
    var messsageIndex = Messages.messageIndex;
    var oldestMessageIndex = Messages.oldestMessageIndex;
    return this.IsRemoveTopOverflow && this.hasScrollBar(container) && oldestMessageIndex < messageIndex;
}

MessageText.prototype.removeTopOverflow = function(Messages) {
    while(this.isOverflow(Messages)) {
        $("#" + Messages.oldestMessageIndex).remove();
        Messages.oldestMessageIndex++;
    }
}

MessageText.prototype.isnewSpeaker = function(Messages){
    var currentMessage = Messages.currentMessage;
    var contentIndex = Messages.contentIndex;
    var allMessages = Messages.allMessages;
    var messageIndex = Messages.messageIndex;

    var LastSpeaker = "";

    if(messageIndex > 0 && contentIndex == 0) {
        LastSpeaker = allMessages[messageIndex - 1]["Name"]; 
    } else if (contentIndex > 0) {
        LastSpeaker = allMessages[messageIndex]["Name"]; 
    }

    return currentMessage["Name"] != LastSpeaker || (this.NewDivForEachMessage && contentIndex == 0);

}

MessageText.prototype.newMessageDiv = function(Messages) {
    var container = Messages.container;
    var currentMessage = Messages.currentMessage;
    var messageIndex = Messages.messageIndex;
    var id = this.makeID(messageIndex);
    console.log(id);
    var tag = this.makeMessageDivTag(id);
    $(container).append(tag);
    targetDiv = "#" + id;
    this.newSpeaker(targetDiv, Messages.currentMessage["Name"]);
    return targetDiv;
}

MessageText.prototype.appendMessage = function(Messages) {
    
    var currentMessage = Messages.currentMessage;
    var targetDiv = Messages.targetDiv;
    var contentIndex = Messages.contentIndex;
    
    if(currentMessage["Type"] == this.Type.Text){
        $(targetDiv).append(currentMessage["Content"][contentIndex]);
        contentIndex++;
    }
    else if (currentMessage["Type"] == this.Type.Image) {
        $(targetDiv).append(this.makeImageTag(currentMessage["Content"]));
        contentIndex = currentMessage["Content"].length;
    }
    return contentIndex;
}

MessageText.doStartCallback = function(Messages) {
    var message = Messages.currentMessage;
    var target = Messages.targetDiv;
    message.StartCallback({
        target: target,
        message: Object.assign({}, message)
    });
}

MessageText.doFinishCallback = function(Messages) {
    var messageIndex = Messages.messageIndex;
    if(messageIndex > 0) {
        var lastMessage = Messages.allMessages[messageIndex - 1];
        lastMessage.StartCallback({
            target: Messages.targetDiv,
            message: Object.assign({}, lastMessage)
        });
    }
}


MessageText.prototype.onNewSpeakerNewDiv = function(Messages){
    var container = Messages.container;
    var currentMessage = Messages.currentMessage;
    var contentIndex = Messages.contentIndex;
    var allMessages = Messages.allMessages;
    var messageIndex = Messages.messageIndex;
    var target = Messages.targetDiv;

    if(this.isnewSpeaker(Messages)) {
        doFinishCallback(Messages);
        target = this.newMessageDiv(Messages);
        doStartCallback(Messages);
    }

    return target;
}

MessageText.prototype.messageDelay = function() {
    if(this.RandomizeMessageInterval) {
        return this.rand(this.MessageInterval);
    } else {
        return this.MessageInterval;
    }    
}

MessageText.prototype.characterDelay = function () {
    if(this.RandomizeCharacterInterval) {
        return this.rand(this.CharacterInterval);
    } else {
        return this.CharacterInterval;
    }
}

// Break this function up
//MessageText.prototype.showText = function (container, targetDiv, currentMessage, contentIndex, interval, allMessages, messageIndex) {
MessageText.prototype.showText = function (Messages) {
    var that = this;
    this.removeTopOverflow(Messages);
    
    if (Messages.contentIndex < Messages.currentMessage["Content"].length) {
        Messages.targetDiv = this.onNewSpeakerNewDiv(Messages);
        
        Messages.contentIndex = this.appendMessage(Messages);
        
        setTimeout(function () { that.showText(Messages); }, this.characterDelay());
    } else if (Messages.messageIndex < Messages.allMessages.length - 1){
        
        // Print next message
        $(Messages.targetDiv).append("<p/>");
        Messages.currentMessage = Messages.allMessages[Messages.messageIndex + 1];
        Messages.messageIndex++;
        Messages.contentIndex = 0;
        setTimeout(function () { that.showText(Messages); }, this.messageDelay());
        
    } else {
        Messages.callback();
    }
}

MessageText.prototype.rand = function(n) {
    return Math.floor(Math.random() * n);
}

MessageText.prototype.makeAttribute = function(Tag, Content) {
    return " " + Tag + "='" + Content + "' ";
}

MessageText.prototype.MakeOpeningTag = function (TagName, Attributes) {
    var tag = "<" + TagName + " ";
    for (var attr in Attributes) {
        tag += this.makeAttribute(attr, Attributes[attr]);
    }
    tag += " />";
    return tag;
}

MessageText.prototype.MakeSingleTag = function (TagName, Attributes) {
    var tag = "<" + TagName + " ";
    for (var attr in Attributes) {
        tag += this.makeAttribute(attr, Attributes[attr]);
    }
    tag += " />";
    return tag;
}


MessageText.prototype.makeImageTag = function(source) {
    var Attributes = {
        class: this.toString(this.ImageClasses),
        src: source
    }
    return this.MakeSingleTag("img", Attributes);
}

MessageText.prototype.makePortraitTag = function(name) {
    var Attributes = {
        class: this.toString(this.PortraitClasses),
        src: this.Portraits[name]
    }
    return this.MakeSingleTag("img", Attributes);
}

MessageText.prototype.makeSpeakerTag = function(content) {
    var Attributes = {
        class: this.toString(this.SpeakerClasses) || ""
    }
    var tag = this.MakeOpeningTag("span", Attributes);
    tag += content;
    tag += "</span>";
    return tag;
}

MessageText.prototype.makeMessageDivTag = function(id) {
    var Attributes = {
        class: this.toString(this.MessageDivClasses) || "",
        id: id || ""
    }
    var tag = this.MakeOpeningTag("div", Attributes);
    tag += "</div>";
    return tag;
}


MessageText.prototype.toString = function(array) {
    return array.join(" ");
}

MessageText.prototype.valueOrDefault = function(dictionary, objectKey, defaultValue) {
    if(objectKey in dictionary) {
        return dictionary[objectKey];
    } else {
        return defaultValue;
    }
}

MessageText.prototype.hasScrollBar = function(target) {
    return $(target).prop('scrollHeight') > $(target).prop('clientHeight');
}

function hasScroll(target) {
    return $(target).prop('scrollHeight') > $(target).prop('clientHeight');
}

MessageText.prototype.createMessageObject = function(name, content, type, intervalOptions) {
    intervalOptions = intervalOptions || {};
    return {
        Name: name || "",
        Content: content || "",
        Type: type || this.Type.Text,
        StartCallback: valueOrDefault(intervalOptions, "StartCallback", this.emptyFunction),
        FinishCallback: valueOrDefault(intervalOptions, "FinishCallback", this.emptyFunction),
        CharacterInterval: valueOrDefault(intervalOptions, "CharacterInterval", this.getCharacterInterval()),
        RandomizeCharacterIntervalOn: valueOrDefault(intervalOptions, "RandomizeCharacterIntervalOn", this.isRandomizeCharacterIntervalOn()),
        MessageInterval: valueOrDefault(intervalOptions, "MessageInterval", this.getMessageInterval()),
        RandomizeMessageInterval: valueOrDefault(intervalOptions, "RandomizeMessageIntervalOn", this.isRandomizeMessageIntervalOn())
    };
}

MessageText.prototype.setTarget = function(targetId) {
    this.Target = targetId;
}

MessageText.prototype.getTarget = function() {
    return this.Target;
}

MessageText.prototype.setRemoveTopOverflowOn = function() {
    this.IsRemoveTopOverflow = true;
}

MessageText.prototype.setRemoveTopOverflowOff = function() {
    this.IsRemoveTopOverflow = false;
}

MessageText.prototype.isRemoveTopOverflowOn = function() {
    return this.IsRemoveTopOverflow;
}

MessageText.prototype.setCharacterInterval = function(ms) {
    this.CharacterInterval = ms;
}

MessageText.prototype.getCharacterInterval = function(ms) {
    return this.CharacterInterval;
}

MessageText.prototype.setMessageInterval = function(ms) {
    this.MessageInterval = ms;
}

MessageText.prototype.getMessageInterval = function() {
    return this.MessageInterval;
}

MessageText.prototype.setRandomizeCharacterIntervalOn = function() {
    this.RandomizeCharacterInterval = true;
}

MessageText.prototype.setRandomizeCharacterIntervalOff = function() {
    this.RandomizeCharacterInterval = false;
}

MessageText.prototype.isRandomizeCharacterIntervalOn = function() {
    return this.RandomizeCharacterInterval;
}

MessageText.prototype.setRandomizeMessageIntervalOn = function() {
    this.RandomizeMessageInterval = true;
}

MessageText.prototype.setRandomizeMessageIntervalOff = function() {
    this.RandomizeMessageInterval = false;
}

MessageText.prototype.isRandomizeMessageIntervalOn = function() {
    return this.RandomizeMessageInterval;
}

MessageText.prototype.setNewDivForEachMessageOn = function() {
    this.NewDivForEachMessage = true;
}

MessageText.prototype.setNewDivForEachMessageOff = function() {
    this.NewDivForEachMessage = false;
}

MessageText.prototype.isNewDivForEachMessageOn = function() {
    return this.NewDivForEachMessage;
}

MessageText.prototype.makeID = function(messageIndex) {
    return "" + this.IDPrefix + messageIndex;
}

MessageText.prototype.setIDPrefix = function(prefix) {
    this.IDPrefix = prefix || "";
}

MessageText.prototype.getIDPrefix = function() {
    return this.IDPrefix;
}

MessageText.prototype.remove = function (array, element) {
    const index = array.indexOf(element);
    if(index != -1) {
        array.splice(index, 1);
    }
}

MessageText.prototype.exists = function(array, element) {
    const index = array.indexOf(element);
    return index != -1;
}

MessageText.prototype.addPortraitClass = function(cssClass) {
    this.PortraitClasses.push(cssClass);
}

MessageText.prototype.removePortraitClass = function(cssClass) {
    this.remove(this.PortraitClasses, cssClass);
}

MessageText.prototype.isPortraitClass = function(cssClass) {
    return this.exists(this.PortraitClasses, cssClass);
}

MessageText.prototype.addSpeakerClasses = function(cssClass) {
    this.SpeakerClasses.push(cssClass);
}

MessageText.prototype.removeSpeakerClasses = function(cssClass) {
    this.remove(this.SpeakerClasses, cssClass);
}

MessageText.prototype.isSpeakerClasses = function(cssClass) {
    return this.exists(this.SpeakerClasses, cssClass);
}

MessageText.prototype.addMessageDivClasses = function(cssClass) {
    this.MessageDivClasses.push(cssClass);
}

MessageText.prototype.removeMessageDivClasses = function(cssClass) {
    this.remove(this.MessageDivClasses, cssClass);
}

MessageText.prototype.isMessageDivClasses = function(cssClass) {
    return this.exists(this.MessageDivClasses, cssClass);
}

MessageText.prototype.addImageClasses = function(cssClass) {
    this.MessageDivClasses.push(cssClass);
}

MessageText.prototype.removeImageClasses = function(cssClass) {
    this.remove(this.ImageClasses, cssClass);
}

MessageText.prototype.isImageClasses = function(cssClass) {
    return this.exists(this.ImageClasses, cssClass);
}

MessageText.prototype.emptyFunction = function(arg) {

}