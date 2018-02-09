MessageText.prototype.NewSpeaker = function(target, name) {
    
    var content = this.MakePortraitTag(name) + name;
    var tag = this.MakeSpeakerTag(content);
    
    $(target).append(tag);
    $(target).append("<p/>");
}

MessageText.prototype.removeTopOverflow = function(container, messageIndex) {
    while(this.IsRemoveTopOverflow && this.hasScrollBar(container) && this.OldestMessageIndex < messageIndex) {
        $("#" + this.OldestMessageIndex).remove();
        this.OldestMessageIndex++;
    }
}

MessageText.prototype.isNewSpeaker = function(currentMessage, contentIndex, allMessages, messageIndex) {
    var LastSpeaker = "";
    if(messageIndex > 0 && contentIndex == 0) {
        LastSpeaker = allMessages[messageIndex - 1]["Name"]; 
    } else if (contentIndex > 0) {
        LastSpeaker = allMessages[messageIndex]["Name"]; 
    }

    return currentMessage["Name"] !== LastSpeaker || contentIndex == 0;

}

MessageText.prototype.newMessageDiv = function(container, currentMessage, messageIndex) {
    var tag = this.MakeMessageDivTag("" + messageIndex);
    $(container).append(tag);
    targetDiv = "#" + messageIndex;
    this.NewSpeaker(targetDiv, currentMessage["Name"]);
    return "#" + messageIndex;
}

MessageText.prototype.appendMessage = function(currentMessage, targetDiv, contentIndex) {
    if(currentMessage["Type"] == this.Type.Text){
        $(targetDiv).append(currentMessage["Content"][contentIndex]);
        contentIndex++;
    }
    else if (currentMessage["Type"] == this.Type.Image) {
        $(targetDiv).append(this.MakeImageTag(currentMessage["Content"]));
        contentIndex = currentMessage["Content"].length;
    }
    return contentIndex;

}

MessageText.prototype.onNewSpeakerNewDiv = function(container, currentMessage, contentIndex, allMessages, messageIndex) {

    if(this.isNewSpeaker(currentMessage, contentIndex, allMessages, messageIndex)) {
        target = this.newMessageDiv(container, currentMessage, messageIndex);
    }
    return target;

}

MessageText.prototype.MessageDelay = function() {
    if(this.RandomizeMessageInterval) {
        return this.rand(this.MessageInterval);
    } else {
        return this.MessageInterval;
    }    
}

MessageText.prototype.CharacterDelay = function () {
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
        Messages.targetDiv = this.onNewSpeakerNewDiv(Messages.container, Messages.currentMessage, Messages.contentIndex, Messages.allMessages, Messages.messageIndex);
        
        Messages.contentIndex = this.appendMessage(Messages.currentMessage, Messages.targetDiv, Messages.contentIndex);
        
        setTimeout(function () { that.showText(Messages); }, this.CharacterDelay());
    } else if (Messages.messageIndex < Messages.allMessages.length - 1){
        
        // Print next message
        $(Messages.targetDiv).append("<p/>");
        Messages.currentMessage = Messages.allMessages[Messages.messageIndex + 1];
        Messages.messageIndex++;
        Messages.contentIndex = 0;
        setTimeout(function () { that.showText(Messages); }, this.MessageDelay());
        
    }
}

MessageText.prototype.rand = function(n) {
    return Math.floor(Math.random() * n);
}

MessageText.prototype.MakeAttribute = function(Tag, Content) {
    return " " + Tag + "='" + Content + "' ";
}

MessageText.prototype.MakeOpeningTag = function (TagName, Attributes) {
    var tag = "<" + TagName + " ";
    for (var attr in Attributes) {
        tag += this.MakeAttribute(attr, Attributes[attr]);
    }
    tag += " />";
    return tag;
}

MessageText.prototype.MakeSingleTag = function (TagName, Attributes) {
    var tag = "<" + TagName + " ";
    for (var attr in Attributes) {
        tag += this.MakeAttribute(attr, Attributes[attr]);
    }
    tag += " />";
    return tag;
}


MessageText.prototype.MakeImageTag = function(source) {
    var Attributes = {
        class: this.ToString(this.ImageClasses),
        src: source
    }
    return this.MakeSingleTag("img", Attributes);
}

MessageText.prototype.MakePortraitTag = function(name) {
    var Attributes = {
        class: this.ToString(this.PortraitClasses),
        src: this.Portraits[name]
    }
    return this.MakeSingleTag("img", Attributes);
}

MessageText.prototype.MakeSpeakerTag = function(content) {
    var Attributes = {
        class: this.ToString(this.SpeakerClasses) || ""
    }
    var tag = this.MakeOpeningTag("span", Attributes);
    tag += content;
    tag += "</span>";
    return tag;
}

MessageText.prototype.MakeMessageDivTag = function(id) {
    var Attributes = {
        class: this.ToString(this.MessageDivClasses) || "",
        id: id || ""
    }
    var tag = this.MakeOpeningTag("div", Attributes);
    tag += "</div>";
    return tag;
}


MessageText.prototype.ToString = function(array) {
    return array.join(" ");
}

MessageText.prototype.ValueOrDefault = function(dictionary, objectKey, defaultValue) {
    if(objectKey in dictionary) {
        return dictionary[objectKey];
    } else {
        return defaultValue;
    }
}

function MessageText(Options) {
    this.Messages = this.ValueOrDefault(Options, "Messages", {});
    this.Target = this.ValueOrDefault(Options, "Target", "");
    this.Type = {Text: 0, Image: 1};
    this.Portraits = this.ValueOrDefault(Options, "Portraits", {});
    this.LastSpeaker = this.ValueOrDefault(Options, "LastSpeaker", "");
    this.OldestMessageIndex = 0;
    this.PortraitClasses = this.ValueOrDefault(Options, "PortraitClasses", ["message-portrait", "img-circle"]);
    this.SpeakerClasses = this.ValueOrDefault(Options, "SpeakerClasses", ["message-name"]);
    this.MessageDivClasses = this.ValueOrDefault(Options, "MessageDivClasses", ["well", "col-lg-12"]);
    this.ImageClasses = this.ValueOrDefault(Options, "ImageClasses", ["message-image"]);
    this.IsRemoveTopOverflow = this.ValueOrDefault(Options, "IsRemoveTopOverflow", false);
    this.CharacterInterval = this.ValueOrDefault(Options, "CharacterInterval", 100);
    this.MessageInterval = this.ValueOrDefault(Options, "CharacterInterval", this.CharacterInterval * 50);
    this.RandomizeCharacterInterval = this.ValueOrDefault(Options, "RandomizeCharacterInterval", true);
    this.RandomizeMessageInterval = this.ValueOrDefault(Options, "RandomizeMessageInterval", true);
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

MessageText.prototype.start = function() {
    var Messages = {
        container: this.Target,
        targetDiv: 0,
        currentMessage: this.Messages[0],
        contentIndex: 0,
        allMessages: this.Messages,
        messageIndex: 0
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
