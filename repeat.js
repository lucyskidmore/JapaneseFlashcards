'use strict';

module.exports = {

    RepeatIntentHandler : {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'repeatIntent';
        },
        handle(handlerInput) {
              
            //getting session attributes 
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes();
            const question = sessionAttributes.currentQuestion;
            
            var speechText = question;
            var repromptText = "The Japanese word is " + question + 
            ". If you don't know the English meaning, you can say, 'reveal'. ";
            
            //set session attributes 
            sessionAttributes.repromptText = repromptText;
                
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(repromptText)
                .getResponse();
        }
    }
};