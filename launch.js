'use strict';

const constants = require('./constants');
const vocabDictMain = constants.vocabDictMain;
const vocabDictLength = vocabDictMain.length;

module.exports = {
  
    LaunchRequestHandler : {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    
    async handle(handlerInput) {
      
        //getting persistent attributes from DynamoDB and setting them for the session
        const attributesManager = handlerInput.attributesManager;
        //const attributes = await attributesManager.getPersistentAttributes() || {};
        const attributes = {};
        attributesManager.setSessionAttributes(attributes);
        const sessionAttributes = attributes;

        var speechText = '';
        
        //new user 
        if (Object.keys(attributes).length === 0) {
              sessionAttributes['newUser'] = true;
              sessionAttributes['vocabListUserIndex'] = 0;
              sessionAttributes['sessionNumber'] = 1;
              sessionAttributes['masteredWords'] = {};
              
              speechText = "Welcome to Japanese Flashcards! " +
              constants.instructions; 
          
        //returning user        
        } else {
              sessionAttributes.newUser = false;
              speechText = "Welcome back to Japanese Flashcards.";
              speechText += " If you want a recap of the instructions, say, 'instructions'. " +
              " If you're ready to start, say, 'let's go'. ";
              sessionAttributes.sessionNumber += 1;
        }

        const repromptText = "If you want a recap of the instructions, say, 'instructions'." +
        " If you're ready to start practicing, say, 'let's go'. ";
        sessionAttributes.repromptText = repromptText;
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .getResponse();
        
  }
}
    
};