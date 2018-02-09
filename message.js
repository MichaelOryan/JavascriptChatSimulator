MessageText.prototype.newSpeaker = function(target, name) {
    
    var content = this.makePortraitTag(name) + name;
    var tag = this.makeSpeakerTag(content);
    
    $(target).append(tag);
    $(target).append("<p/>");
}

MessageText.prototype.isOverflow = function(container, messageIndex) {
    return this.IsRemoveTopOverflow && this.hasScrollBar(container) && this.OldestMessageIndex < messageIndex;
}

MessageText.prototype.removeTopOverflow = function(container, messageIndex) {
    while(this.isOverflow(container, messageIndex)) {
        $("#" + this.OldestMessageIndex).remove();
        this.OldestMessageIndex++;
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

MessageText.prototype.newMessageDiv = function(container, currentMessage, messageIndex) {
    var tag = this.makeMessageDivTag("" + messageIndex);
    $(container).append(tag);
    targetDiv = "#" + messageIndex;
    this.newSpeaker(targetDiv, currentMessage["Name"]);
    return "#" + messageIndex;
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

MessageText.prototype.onNewSpeakerNewDiv = function(Messages){
    var container = Messages.container;
    var currentMessage = Messages.currentMessage;
    var contentIndex = Messages.contentIndex;
    var allMessages = Messages.allMessages;
    var messageIndex = Messages.messageIndex;
    var target = Messages.targetDiv;

    if(this.isnewSpeaker(Messages)) {
        target = this.newMessageDiv(container, currentMessage, messageIndex);
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
    this.removeTopOverflow(Messages.container, Messages.messageIndex);
    
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

function MessageText(Options) {
    this.Messages = this.valueOrDefault(Options, "Messages", {});
    this.Target = this.valueOrDefault(Options, "Target", "");
    this.Type = {Text: 0, Image: 1};
    this.Portraits = this.valueOrDefault(Options, "Portraits", {});
    this.LastSpeaker = this.valueOrDefault(Options, "LastSpeaker", "");
    this.OldestMessageIndex = 0;
    this.PortraitClasses = this.valueOrDefault(Options, "PortraitClasses", ["message-portrait", "img-circle"]);
    this.SpeakerClasses = this.valueOrDefault(Options, "SpeakerClasses", ["message-name"]);
    this.MessageDivClasses = this.valueOrDefault(Options, "MessageDivClasses", ["well", "col-lg-12"]);
    this.ImageClasses = this.valueOrDefault(Options, "ImageClasses", ["message-image"]);
    this.IsRemoveTopOverflow = this.valueOrDefault(Options, "IsRemoveTopOverflow", false);
    this.CharacterInterval = this.valueOrDefault(Options, "CharacterInterval", 100);
    this.MessageInterval = this.valueOrDefault(Options, "CharacterInterval", this.CharacterInterval * 50);
    this.RandomizeCharacterInterval = this.valueOrDefault(Options, "RandomizeCharacterInterval", true);
    this.RandomizeMessageInterval = this.valueOrDefault(Options, "RandomizeMessageInterval", true);
    this.NewDivForEachMessage = this.valueOrDefault(Options, "NewDivForEachMessage", true);
}

MessageText.prototype.hasScrollBar = function(target) {
    return $(target).prop('scrollHeight') > $(target).prop('clientHeight');
}

function hasScroll(target) {
    return $(target).prop('scrollHeight') > $(target).prop('clientHeight');
}

MessageText.prototype.createMessageObject = function(name, content, type) {
    return {Name: name, Content: content, Type: type};
}

MessageText.prototype.addMessage = function(name, message, type) {
    this.Messages.push(this.createMessageObject(name, message, type));
}

MessageText.prototype.start = function(callback) {
    var Messages = {
        container: this.Target,
        targetDiv: 0,
        currentMessage: this.Messages[0],
        contentIndex: 0,
        allMessages: this.Messages,
        messageIndex: 0,
        callback: callback
    };
    this.showText(Messages);
}

MessageText.prototype.addPortrait = function(name, url) {
    this.Portraits[name] = url;
}

MessageText.prototype.replacePortraits = function(portraits) {
    this.Portraits = portraits;
}

MessageText.prototype.replaceMessages = function(messages) {
    this.Messages = messages
}
