import $ from "jquery";
import DscNodeManager from "./DscNodeManager";
import TemplateManager from "./TemplateManager";
import TemplateUIBuilder from "./TemplateUIBuilder";
import FormValidator from "./FormValidator";
import Handlebars from "handlebars";
import HandleBarManager from "./HandleBarManager";
import PowerShellManager from "./PowerShellManager";
import UI from "./UI";
import Strings from "./Strings";

export default {
    Views: {
        Start: "start",
        Response: "response",
        Output: "output"
    },
    ResponseTabs: {
        ConfigData: "configdata",
        Questionaire: "questionaire"
    },
    AddClass: function(selector, className) {
        $(selector).addClass(className);
    },
    AppendText: function(selector, text) {
        $(selector).append(text);
    },
    ApplyStyles: function() {
        $("h1").addClass("ms-font-su");
        $("h2").addClass("ms-font-xxl");
        $("h3").addClass("ms-font-xl");
        $("p").addClass("ms-font-m");
    },
    BuildQuestionUI: function(template) {
        TemplateUIBuilder.BuildPrimaryUI(template);
        TemplateUIBuilder.BuildQuestionUI(TemplateManager.GetQuestionGroups(template));
        TemplateUIBuilder.BuildNewNodeUI();
        FormValidator.EnableQuestionValidation();
        FormValidator.ValidateAllNodeData();
    },
    ClearNodeSettingsValues: function(NodeSettings) {
        NodeSettings.forEach(function(setting) {
            switch(setting.valueType) {
                case "text":
                case "number":
                case "choice":
                    $("#nodeSetting-" + setting.powershellName + "-value").val("");
                    break;
                case "boolean":
                    $("#nodeSetting-" + setting.powershellName + " label").removeClass("is-selected");
                    break; 
                default:
                    this.SendAlert(Strings.ErrorNodeSettingTypeNotSupported); 
                    return;
            }
        });
        $("#NewNodeName").val("");
    },
    ConfirmAction: function(message, replacements) {
        var newMessage = message;
        if (replacements !== undefined) {
            var count = 0;
            replacements.forEach(function(replacement) {
                newMessage = newMessage.replace(`{${count}}`, replacement);
            }, this); 
        }
        return confirm(newMessage);
    },
    Document: function() {
        return document;
    },
    DownloadCurrentScript: function() {
        var blob = new Blob([PowerShellManager.CurrentScript], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, Strings.DefaultDownloadFileName);
    },
    EmptyObject: function(selector) {
        $(selector).empty();
    },
    GenericSelector: function(selector) {
        return $(selector);
    },
    GetScrollPosition: function () {
        if (typeof window.pageYOffset !== 'undefined' ) {
            // Most browsers
            return window.pageYOffset;
        }

        var d = document.documentElement;
        if (d.clientHeight) {
            // IE in standards mode
            return d.scrollTop;
        }

        // IE in quirks mode
        return document.body.scrollTop;
    },
    GetUIElements: function(selector) {
        return $(selector);
    },
    GetValue: function(selector) {
        return $(selector).val();
    },
    HideElement: function(elementId) {
        $(`#${elementId}`).hide();
    },
    Initialise: function() {
        UI.ApplyStyles();
        UI.InitialiseEvents();
        UI.InitialiseFabricControls();
    },
    InitialiseEvents: function() {
        UI.RegisterEvent('#templateSelector', 'change', function() {
            if (UI.SetTemplateFromFilePicker(this) === true) {
                UI.SwitchResponseTab(UI.ResponseTabs.ConfigData);
            }
        });

        UI.RegisterEvent('#goBackToResponses', 'click', function() {
            UI.SwitchView(UI.Views.Response);
            UI.SwitchResponseTab(UI.ResponseTabs.ConfigData);
        });

        UI.RegisterEvent('#switchView-Config', 'click', function() {
            UI.SwitchResponseTab(UI.ResponseTabs.ConfigData);
        });

        UI.RegisterEvent('#switchView-Questions', 'click', function() {
            UI.SwitchResponseTab(UI.ResponseTabs.Questionaire);
            UI.SetNavBarPosition();
        });

        UI.RegisterEvent('#GenerateConfig', 'click', function() {
            FormValidator.ValidateForm(true);
        });

        UI.RegisterEvent('#newNodeCommand', 'click', function() {
            if (DscNodeManager.CanNewNodesBeAdded() === true) {
                UI.OpenDialog('newNodeDialog');
            } else {
                UI.SendAlert(Strings.ErrorTooManyNodes, [DscStudio.CurrentTemplate.configDataSettings.maxNodeCount.toString()]);
            }
        });

        UI.RegisterEvent(UI.Window(), 'scroll', function() {
            UI.SetNavBarPosition();
        });

        UI.RegisterEvent(UI.Window(), 'resize', function() {
            UI.SetNavBarPosition();
        });

        UI.RegisterEvent("#saveConfig", 'click', function() {
            PowerShellManager.DownloadCurrentScript();
        });

        $("#code-expandButton").on('click', function() {
            UI.ToggleCodeMinimiseFrame();
        });

        UI.RegisterEvent("#ViewLicense", 'click', function() {
            UI.SendAlert(`The MIT License (MIT)

Copyright (c) 2016 Microsoft

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`);
        });

        new fabric.Button(document.querySelector("#addNewNode"), DscNodeManager.AddNewNode);
    },
    InitialiseFabricControls: function() {
        var CommandBarElements = UI.Document().querySelectorAll(".ms-CommandBar");
        for(var commandBarCount = 0; commandBarCount < CommandBarElements.length; commandBarCount++) {
            new fabric.CommandBar(CommandBarElements[commandBarCount]);
        }

        var ListElements = UI.Document().querySelectorAll(".ms-List");
        for(var listElementsCount = 0; listElementsCount < ListElements.length; listElementsCount++) {
            new fabric.List(ListElements[listElementsCount]);
        }

        var ToggleElements = UI.Document().querySelectorAll(".ms-Toggle");
        for(var toggleElementsCount = 0; toggleElementsCount < ToggleElements.length; toggleElementsCount++) {
            new fabric.Toggle(ToggleElements[toggleElementsCount]);
        }
    },
    InitialisePanels: function() {
        var panels = document.getElementsByClassName("ms-PanelExample");
        for (var count = 0; count < panels.length; count++) {
            UI.InitialisePanel(panels[count]);
        }
    },
    InitialisePanel: function(container) {
        var button = container.querySelector(".ms-Button");
        var panel = container.querySelector(".ms-Panel");
        button.addEventListener("click", function(i) {
            new _fabric.Panel(panel);
        });
    },
    IsElementVisible: function(selector) {
        return $(selector).is(':visible');
    },
    OpenDialog: function(dialogId) {
        var dialog = document.getElementById(dialogId);
        var dialogComponent = new fabric.Dialog(dialog);
        dialogComponent.open();
    },
    ReadNodeSettingResponse: function(nodeSetting) {
        var internalValue;
            switch(nodeSetting.valueType) {
                case "text":
                case "number":
                case "choice":
                    return $("#nodeSetting-" + nodeSetting.powershellName + "-value").val();
                case "boolean":
                    return $("#nodeSetting-" + nodeSetting.powershellName + " label").hasClass("is-selected");
                default:
                    this.SendAlert(Strings.ErrorNodeSettingTypeNotSupported); 
                    return;
            }
    },
    ReadQuestionResponse: function(question) {
        switch (question.type) {
            case "text":
            case "number":
            case "filepath":
            case "regex":
            case "complextype":
                return $(`#question-${question.id}-value`).val();
            case "boolean":
                return $(`#question-${question.id} label`).hasClass("is-selected");
            case "choice":
                return $(`#question-${question.id}-value`).val();
            case "textarray":
                var values = "";
                $.each($(`#question-${question.id}-value option`), function(item) {
                    if (values === "") {
                        values += this.text;
                    } else {
                        values += ";" + this.text;
                    }
                });
                return values;
            default:
                this.SendAlert(Strings.ErrorQuestionTypeNotSupported, [question.type]);
                break;
        }
    },
    RegisterEvent: function(target, method, callback) {
        $(target).on(method, callback);
    },
    RemoveAttribute: function(selector, attribute) {
        $(selector).removeAttr(attribute);
    },
    RemoveClass: function(selector, className) {
        $(selector).removeClass(className);
    },
    RemoveElement: function(selector) {
        $(selector).remove();
    },
    RemoveValueFromSelectList: function(listSelector,optionValue) {
        $(listSelector).children(`option[value="${optionValue}"]`).remove();
    },
    RenderUISection: function(templateName, context, appendTo) {
        $("#nodeList").empty();
        var template = Handlebars.compile(HandleBarManager[templateName]);
        $(appendTo).append(template(context));
    },
    SendAlert: function(message, replacements) {
        var newMessage = message;
        if (replacements !== undefined) {
            var count = 0;
            replacements.forEach(function(replacement) {
                newMessage = newMessage.replace(`{${count}}`, replacement);
            }, this);
        }
        alert(newMessage);
    },
    SetAttribute: function(selector,attribute,value) {
        $(selector).attr(attribute, value);
    },
    SetNavBarPosition: function() {
        var configButton = $("#GenerateConfig");
        var configPosition = configButton.offset();

        var scrollPosition = UI.GetScrollPosition();
        var baseOffset = configButton.height() + configPosition.top;
        if (scrollPosition < baseOffset) {
            $("#navBox").css("top", 0);
        } else {
            $("#navBox").css("top", scrollPosition - baseOffset);
        }
    },
    SetTemplateFromFilePicker: function(filepicker) {
        var reader = new FileReader();
        if(filepicker.files && filepicker.files[0]) {
            reader.onload = function(contents) {
                TemplateManager.ParseTemplate(JSON.parse(contents.target.result));
            };
            reader.readAsText(filepicker.files[0]);
            return true;
        }
        else 
        {
            this.SendAlert(Strings.ErrorUnableToReadFileContents);
            return false;
        }
    },
    SetText: function(selector, text) {
        $(selector).text(text);
    },
    SetValue: function(selector,value) {
        $(selector).val(value);
    },
    ShowElement: function(elementId) {
        $(`#${elementId}`).show();
    },
    SupportedBrowser: function() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            return true;
        } else {
            return false;
        }
    },
    SwitchResponseTab: function(tabName) {
        switch(tabName) 
        {
            case "configdata":
                $("#configDataEditor").show();
                $("#switchView-Config").parent().addClass("ms-bgColor-themeLight");
                $("#QuestionnaireEditor").hide();
                $("#switchView-Questions").parent().removeClass("ms-bgColor-themeLight");
                $("#navBox").hide();
                break;
            case "questionaire":
                $("#configDataEditor").hide();
                $("#switchView-Config").parent().removeClass("ms-bgColor-themeLight");
                $("#QuestionnaireEditor").show();
                $("#switchView-Questions").parent().addClass("ms-bgColor-themeLight");
                $("#navBox").show();
                break;
            default:
                throw tabName + " is an unknown tab to switch this form to";
        }
    },
    SwitchView: function(viewName) {
        this.HideElement("templateStart");
        this.HideElement("templateResponse");
        this.HideElement("templateOutput");
        
        switch(viewName) {
            case "start":
                this.ShowElement("templateStart");
                break;
            case "response":
                this.ShowElement("templateResponse");
                break;
            case "output":
                this.ShowElement("templateOutput");

                $("#moduleDownloadScript").text(PowerShellManager.DownloadScript);
                $("#scriptContentParent").empty();
                $("#scriptContentParent").html("<pre id=\"scriptContent\" class=\"brush: powershell\">" + PowerShellManager.CurrentScript + "</pre>");

                UI.ApplyStyles();

                SyntaxHighlighter.highlight();
                break;
            default:
                throw view + " is an unknown view to switch this form to";
        }
    },
    ToggleCodeMinimiseFrame: function() {
        if ($("#code-minimise-button").attr('class') == "ms-Icon ms-Icon--ChevronDown") {
            // expand 
            $("#code-minimise-button").attr('class', "ms-Icon ms-Icon--ChevronUp");
            $("#scriptContentParent").attr('class', "code-expanded");
        } else {
            // collapse
            $("#code-minimise-button").attr('class', "ms-Icon ms-Icon--ChevronDown");
            $("#scriptContentParent").attr('class', "code-minimise");
        }
    },
    UpdateToggle: function(id) {
        new fabric.Toggle(UI.Document().getElementById(id));
    },
    Window: function() {
        return window;
    }
};
