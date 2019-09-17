'use strict';

const constants = require('./constants');

module.exports = {

    InstructionsIntentHandler : {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'instructionsIntent';
        },
        handle(handlerInput) {
              
            //getting session attributes
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes();
            
            var instructions = constants.instructions;
            var speechText = instructions;
            var repromptText = " To hear the instructions again, say, 'instructions'."
            
            //set session attributes 
            sessionAttributes.repromptText = repromptText;
                
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(repromptText)
                .getResponse();
        }
    }
};