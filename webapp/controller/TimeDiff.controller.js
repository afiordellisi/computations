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
          if (oEvent.getParameter === undefined) {
            var computationID = oEvent.ID;
            var imposta = oEvent.imposta;
          } else {
            var oEvent = oEvent.getParameter("arguments");
            var computationID = oEvent.ID;
            var imposta = oEvent.imposta;
          }
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

              var oTotale = [
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

              

              data.push(oTotale[0]);

              var oModel = new JSONModel(data);
              that.getView().setModel(oModel, "oModelTiming");
              that._setTotali();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setTotali: function () {
          var oModel = this.getView().getModel("oModelTiming");
          var data = oModel.getData();
          var oTotale = this.getView().getModel("oModelTiming").getData()[
            data.length - 1
          ];

          oTotale = {
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
          };

          for (var i = 0; i < data.length - 1; i++) {
            if (data[i].OpeningBalance) {
              oTotale.OpeningBalance += data[i].OpeningBalance;
            }

            if (data[i].PriorYearAdjustments) {
              oTotale.PriorYearAdjustments += data[i].PriorYearAdjustments;
            }

            if (data[i].extraordinaryTransactions) {
              oTotale.extraordinaryTransactions +=
                data[i].extraordinaryTransactions;
            }

            if (data[i].CurrentYearAccrual) {
              oTotale.CurrentYearAccrual += data[i].CurrentYearAccrual;
            }

            if (data[i].CurrentYearUtilization) {
              oTotale.CurrentYearUtilization += data[i].CurrentYearUtilization;
            }

            if (data[i].otherAdjustments) {
              oTotale.otherAdjustments += data[i].otherAdjustments;
            }

            if (data[i].closingBalance) {
              oTotale.closingBalance += data[i].closingBalance;
            }

            if (data[i].current1) {
              oTotale.current1 += data[i].current1;
            }

            if (data[i].current2) {
              oTotale.current2 += data[i].current2;
            }

            if (data[i].current3) {
              oTotale.current3 += data[i].current3;
            }

            if (data[i].longTerm) {
              oTotale.longTerm += data[i].longTerm;
            }
          }

          for (var i = 0; i < data.length; i++) {
            data[i].closingBalance =
              data[i].OpeningBalance +
              data[i].PriorYearAdjustments +
              data[i].extraordinaryTransactions +
              data[i].CurrentYearAccrual +
              data[i].CurrentYearUtilization +
              data[i].otherAdjustments;

            if (data[i].OpeningBalance === null) {
              data[i].OpeningBalance = 0;
            }

            if (data[i].PriorYearAdjustments === null) {
              data[i].PriorYearAdjustments = 0;
            }

            if (data[i].extraordinaryTransactions === null) {
              data[i].extraordinaryTransactions = 0;
            }

            if (data[i].CurrentYearAccrual === null) {
              data[i].CurrentYearAccrual = 0;
            }

            if (data[i].CurrentYearUtilization === null) {
              data[i].CurrentYearUtilization = 0;
            }

            if (data[i].otherAdjustments === null) {
              data[i].otherAdjustments = 0;
            }

            if (data[i].current1 === null) {
              data[i].current1 = 0;
            }

            if (data[i].current2 === null) {
              data[i].current2 = 0;
            }

            if (data[i].current3 === null) {
              data[i].current3 = 0;
            }

            if (data[i].longTerm === null) {
              data[i].longTerm = 0;
            }
          }

          //modelloTotali = data.concat(oTotale)

          oModel.getData()[data.length - 1] = oTotale;

          oModel.refresh();
        },

        onValueChanged: function (oEvent) {
          var path = oEvent
            .getSource()
            .getParent()
            .getBindingContext("oModelTiming")
            .getPath()
            .substring(1);
          this.getView().getModel("oModelTiming").getData()[
            path
          ].updated = true;
          this.getView().getModel("oModelTiming").getData()[path].state =
            "Warning";
        },

        onPressSave: function (oEvent) {
          this.onOpenBusyDialog();
          var modello = this.getView().getModel("oModelTiming").getData();
          var array = [];
          array = modello.filter((item) => item.updated === true);
          var computation = modello[0].computationId;
          var imposta = modello[0].imposta;
          var that = this;

          var oObject = { ID: computation, imposta: imposta };

          if(array.length > 0){
            for (var i = 0; i < array.length; i++) {
                var codiceRipresa = array[i].codiceRipresa;
                var extraordinaryTransaction = parseFloat(
                array[i].extraordinaryTransactions
                );
                var otherAdjustment = parseFloat(array[i].otherAdjustments);
                var current2 = parseFloat(array[i].current2);
                var current3 = parseFloat(array[i].current3);
                var longTerm = parseFloat(array[i].longTerm);

                var indice = that
                .getView()
                .getModel("oModelTiming")
                .getData()
                .findIndex((x) => x.codiceRipresa === codiceRipresa);
                var them = that;

                var nuovaTiming = JSON.stringify({
                extraordinaryTransactions: extraordinaryTransaction,
                otherAdjustments: otherAdjustment,
                current2: current2,
                current3: current3,
                longTerm: longTerm,
                });

                jQuery.ajax({
                url: jQuery.sap.getModulePath(
                    sap.ui.getCore().sapAppID +
                    "/catalog/TimingDifferences(codiceRipresa='" +
                    codiceRipresa +
                    "',computation=" +
                    computation +
                    ",imposta='" +
                    imposta +
                    "')"
                ),
                contentType: "application/json",
                type: "PATCH",
                dataType: "json",
                data: nuovaTiming,
                async: false,
                success: function (oCompleteEntry) {
                    them.getView().getModel("oModelTiming").getData()[
                    indice
                    ].state = "Success";
                    them.getView().getModel("oModelTiming").getData()[
                        indice
                      ].updated = false;
                },
                error: function (error) {
                    them.getView().getModel("oModelTiming").getData()[
                    indice
                    ].state = "Error";
                },
                });
            }

          this._setTotali();
          this.onCloseBusyDialog();
          }
          else{
              sap.m.MessageToast.show(this.getResourceBundle().getText("valorizzareRecord"));
              this.onCloseBusyDialog();
          }
        }
      }
    );
  }
);
