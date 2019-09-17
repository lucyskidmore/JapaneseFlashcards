'use strict';

const practice = require('./practice');
const practiceVocab = practice.practiceVocab;

module.exports = {

    RevealIntentHandler : {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'revealIntent';
        },
        handle(handlerInput) {
              
            //getting session attributes 
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes();
            const question = sessionAttributes.currentQuestion;
            const answer = sessionAttributes.currentAnswer;
            var leitnerDecks = sessionAttributes.leitnerDecks;
            
            var speechText = question + " in English, means, " + answer + 
            ". Let's try again";
            speechText += practiceVocab(handlerInput, leitnerDecks);
            var repromptText = "What is the English meaning of " +
            practiceVocab(handlerInput, leitnerDecks);
            
            //set session attributes 
            sessionAttributes.repromptText = repromptText;
                
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(repromptText)
                .getResponse();
        }
    }
};