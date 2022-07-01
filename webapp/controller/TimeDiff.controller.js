sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "./BaseController",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, BaseController, ODataModel) {
    "use strict";

    return BaseController.extend(
      "tax.provisioning.computations.controller.TimeDiff",
      {
        onInit: function () {
          sap.ui.getCore().sapAppID = this.getOwnerComponent()
            .getMetadata()
            .getManifest()["sap.app"].id;
          this.getOwnerComponent()
            .getRouter()
            .getRoute("TimeDiff")
            .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
          var oEvent = oEvent.getParameter("arguments");
          var computationID = oEvent.ID;
          var imposta = oEvent.imposta;

          var dataTestata = { computationID: computationID, imposta: imposta };
          var DataModelTestata = new sap.ui.model.json.JSONModel();
          DataModelTestata.setData(dataTestata);
          this.getView().setModel(DataModelTestata, "oModelTestata");

          var that = this;

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/TimingDifferencesView(imposta='" +
                imposta +
                "',computationId=" +
                computationID +
                ")/Set"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var data = oCompleteEntry.value;
              

              var modello = [
                {
                  computationId: null,
                  imposta: null,
                  codiceRipresa: "",
                  descrizioneRipresa: "Totale",
                  OpeningBalance: 0,
                  PriorYearAdjustments: 0,
                  CurrentYearAccrual: 0,
                  CurrentYearUtilization: 0,
                  extraordinaryTransactions: 0,
                  otherAdjustments: 0,
                  closingBalance: 0,
                  current1: 0,
                  current2: 0,
                  current3: 0,
                  longTerm: 0,
                },
              ];

              // var DataModel2 = new sap.ui.model.json.JSONModel();
              // var totali = {totaleOB : 0, totalePRA : 0, totaleExt : 0, totaleCYA : 0, totaleCYU : 0, totaleOtA : 0, totaleCB : 0, totaleC1 : 0, totaleC2 : 0, totaleC3 : 0, totaleLT : 0};

              for (var i = 0; i < oCompleteEntry.value.length; i++) {
                if (oCompleteEntry.value[i].OpeningBalance) {
                  //oCompleteEntry.value[i].OpeningBalance = 0;
                  modello[0].OpeningBalance +=
                    oCompleteEntry.value[i].OpeningBalance;
                }

                if (oCompleteEntry.value[i].PriorYearAdjustments) {
                  modello[0].PriorYearAdjustments +=
                    oCompleteEntry.value[i].PriorYearAdjustments;
                }

                if (oCompleteEntry.value[i].extraordinaryTransactions) {
                  modello[0].extraordinaryTransactions +=
                    oCompleteEntry.value[i].extraordinaryTransactions;
                }

                if (oCompleteEntry.value[i].CurrentYearAccrual) {
                  modello[0].CurrentYearAccrual +=
                    oCompleteEntry.value[i].CurrentYearAccrual;
                }

                if (oCompleteEntry.value[i].CurrentYearUtilization) {
                  modello[0].CurrentYearUtilization +=
                    oCompleteEntry.value[i].CurrentYearUtilization;
                }

                if (oCompleteEntry.value[i].otherAdjustments) {
                  modello[0].otherAdjustments +=
                    oCompleteEntry.value[i].otherAdjustments;
                }

                if (oCompleteEntry.value[i].closingBalance) {
                  modello[0].closingBalance +=
                    oCompleteEntry.value[i].closingBalance;
                }

                if (oCompleteEntry.value[i].current1) {
                  modello[0].current1 += oCompleteEntry.value[i].current1;
                }

                if (oCompleteEntry.value[i].current2) {
                  modello[0].current2 += oCompleteEntry.value[i].current2;
                }

                if (oCompleteEntry.value[i].current3) {
                  modello[0].current3 += oCompleteEntry.value[i].current3;
                }

                if (oCompleteEntry.value[i].longTerm) {
                  modello[0].longTerm += oCompleteEntry.value[i].longTerm;
                }
              }

              data.push(modello[0]);

              for (var i = 0; i < data.length; i++) {
                data[i].closingBalance =
                  data[i].OpeningBalance +
                  data[i].PriorYearAdjustments +
                  data[i].extraordinaryTransactions +
                  data[i].CurrentYearAccrual +
                  data[i].CurrentYearUtilization +
                  data[i].otherAdjustments;
              }

              var oModel = new JSONModel(data);
              that.getView().setModel(oModel, "oModelTiming");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        onValueChanged: function (oEvent){
            var path = oEvent.getSource().getParent().getBindingContext("oModelTiming").getPath().substring(1);
            this.getView().getModel("oModelTiming").getData()[path].updated = true;
        }, 

        onPressSave: function(oEvent){
            var modello = this.getView().getModel("oModelTiming").getData();
            var array = [];
                array = modello.filter(item => item.updated === true);
            var computation = modello[0].computationId;
            var imposta = modello[0].imposta;
            // var codiciRipresa = [];
            // var extraordinaryTransactions = [];
            // var otherAdjustments = [];
            // var currents2 = [];
            // var currents3 = [];
            // var longTerms = [];

            for(var i = 0; i < array.length; i++){
                var codiceRipresa = array[i].codiceRipresa;
                var extraordinaryTransaction = parseFloat(array[i].extraordinaryTransactions);
                var otherAdjustment =  parseFloat(array[i].otherAdjustments);
                var current2 = parseFloat(array[i].current2);
                var current3 = parseFloat(array[i].current3);
                var longTerm = parseFloat(array[i].longTerm);

                var nuovaTiming = JSON.stringify({"extraordinaryTransactions": extraordinaryTransaction, "otherAdjustments": otherAdjustment, "current2": current2, "current3": current3, "longTerm": longTerm});
                
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TimingDifferences(codiceRipresa='" + codiceRipresa + "',computation=" + computation + ",imposta='" + imposta + "')"),
                    contentType: "application/json",
                    type: 'PATCH',
                    dataType: "json",
                    data: nuovaTiming,
                    async: false,
                    success: function (oCompleteEntry) {
                        console.log("Success");
                    },
                    error: function (error) {
                        console.log("Error");
                    }
                });
            }

            
        }
      }
    );
  }
);
