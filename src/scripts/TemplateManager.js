import $ from "jquery";
import TemplateUIBuilder from "./TemplateUIBuilder";
import ViewManager from "./ViewManager";
import FormValidator from "./FormValidator";

export default {
    CurrentTemplate: "",
    QuestionGroups: {},
    Init: function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {} else {
            alert('Your browser does not support HTML5 file APIs. Please open this from a browser that supports HTML5.');
            return false;
        }

        if (DynamicTemplate !== undefined) {
            this.ReadTemplateFromDynamicSource();
        }
    },
    StartTemplateRead: function(filepicker) {
        var reader = new FileReader();
        var self = this;
        if(filepicker.files && filepicker.files[0]) {
            reader.onload = function(contents) {
                DscStudio.CurrentTemplate = JSON.parse(contents.target.result);
                self.ReadTemplate();
            };
            reader.readAsText(filepicker.files[0]);
            return true;
        }
        else 
        {
            return false;
        }
    },
    ReadTemplateFromDynamicSource: function() {
        DscStudio.CurrentTemplate = DynamicTemplate;
        this.ReadTemplate();
        $("#navBox").hide();
    },
    ReadTemplate: function() {
        var questionGroups = {};
        DscStudio.CurrentTemplate.questions.forEach(function(question) {
            if (question.group !== undefined) {
                if (questionGroups.hasOwnProperty(question.group) === false) {
                    questionGroups[question.group] = [];
                }
                questionGroups[question.group].push(question);
            } else {
                if (questionGroups.hasOwnProperty("Other questions") === false) {
                    questionGroups["Other questions"] = [];
                }
                question.group = "Other questions";
                questionGroups["Other questions"].push(question);
            }
        });
        this.QuestionGroups = questionGroups;
        this.GenerateTemplateUI();
    },
    GenerateTemplateUI: function() {
        TemplateUIBuilder.BuildPrimaryUI(DscStudio.CurrentTemplate);
        TemplateUIBuilder.BuildQuestionUI(this.QuestionGroups);
        TemplateUIBuilder.BuildNewNodeUI();
        FormValidator.EnableQuestionValidation();
        FormValidator.ValidateNodeData();
        ViewManager.ShowView('response');
    },
    StoreQuestionResponses: function() {
        var responses = [];

        DscStudio.CurrentTemplate.questions.forEach(function(question) {
            switch (question.type) {
                case "text":
                case "number":
                case "filepath":
                case "regex":
                case "complextype":
                    responses[question.id] = $("#question-" + question.id + "-value").val();
                    break;
                case "boolean":
                    responses[question.id] = $("#question-" + question.id + " label").hasClass("is-selected");
                    break;
                case "choice":
                    responses[question.id] = $("#question-" + question.id + "-value").val();
                    break;
                case "textarray":
                    var values = "";
                    $.each($("#question-" + question.id + "-value option"), function(item) {
                        if (values === "") {
                            values += this.text;
                        } else {
                            values += ";" + this.text;
                        }
                    });
                    responses[question.id] = values;
                    break;
                default:
                    alert("question type " + question.type + " does not have support for storing responses");
                    break;
            }
        });
        DscStudio.Responses = responses;
    }
};
