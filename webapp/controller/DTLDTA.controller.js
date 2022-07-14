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
      "tax.provisioning.computations.controller.DTLDTA",
      {
        onInit: function () {
          sap.ui.getCore().sapAppID = this.getOwnerComponent()
            .getMetadata()
            .getManifest()["sap.app"].id;
          this.getOwnerComponent()
            .getRouter()
            .getRoute("DTLDTA")
            .attachPatternMatched(this._onObjectMatched, this);

          var oModel, oView, sServiceUrl;
          //this.getView().byId("LineItemsSmartTable").setModel("computationsModel");
          sServiceUrl = jQuery.sap.getModulePath(
            sap.ui.getCore().sapAppID + "/v2/catalog/"
          );
          oModel = new ODataModel(sServiceUrl, {
            defaultCountMode: "None",
          });

          oView = this.getView();
          oView.setModel(oModel);
        },

        _onObjectMatched: function (oEvent) {
          var oEvent = oEvent.getParameter("arguments");
          var computationID = oEvent.ID;
          var imposta = oEvent.imposta;

          var dataTestata = { computationID: computationID, imposta: imposta };
          var DataModelTestata = new sap.ui.model.json.JSONModel();
          DataModelTestata.setData(dataTestata);
          this.getView().setModel(DataModelTestata, "oModelTestata");

          //oView = this.getView().byId("LineItemsSmartTable");
          //this.getView().byId("LineItemsSmartTable").setModel(oModel);

          var that = this;

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/DTView(imposta='" +
                imposta +
                "',computationId=" +
                computationID +
                ")/Set"
            ),
            // url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni"),
            // contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var oModel = new JSONModel(data);
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
                  closingGrossBalance: 0,
                  changeTaxRate: 0,
                  devaluationOpening: 0,
                  devaluationMovement: 0,
                  devaluationClosing: 0,
                  closingNetBalance: 0,
                  movementPL: 0,
                  current1: 0,
                  current2: 0,
                  current3: 0,
                  longTerm: 0,
                  movementBS: 0,
                },
              ];

              data.push(oTotale[0]);

              oModel.setData(data);
              that.getView().setModel(oModel, "oModelDT");
              that._setTotali();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setTotali: function () {
          var oModel = this.getView().getModel("oModelDT");
          var data = oModel.getData();
          var oTotale = this.getView().getModel("oModelDT").getData()[
            data.length - 1
          ];

          var oTotale = {
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
            closingGrossBalance: 0,
            changeTaxRate: 0,
            devaluationOpening: 0,
            devaluationMovement: 0,
            devaluationClosing: 0,
            closingNetBalance: 0,
            movementPL: 0,
            current1: 0,
            current2: 0,
            current3: 0,
            longTerm: 0,
            movementBS: 0,
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

            if (data[i].changeTaxRate) {
              oTotale.changeTaxRate += data[i].changeTaxRate;
            }

            if (data[i].closingGrossBalance) {
              oTotale.closingGrossBalance += data[i].closingGrossBalance;
            }

            if (data[i].devaluationOpening) {
              oTotale.devaluationOpening += data[i].devaluationOpening;
            }

            if (data[i].devaluationMovement) {
              oTotale.devaluationMovement += data[i].devaluationMovement;
            }

            if (data[i].devaluationClosing) {
              oTotale.devaluationClosing += data[i].devaluationClosing;
            }

            if (data[i].closingNetBalance) {
              oTotale.closingNetBalance += data[i].closingNetBalance;
            }

            if (data[i].movementPL) {
              oTotale.movementPL += data[i].movementPL;
            }

            if (data[i].movementBS) {
              oTotale.movementBS += data[i].movementBS;
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

            if (data[i].changeTaxRate === null) {
              data[i].changeTaxRate = 0;
            }

            if (data[i].closingGrossBalance === null) {
              data[i].closingGrossBalance = 0;
            }

            if (data[i].devaluationOpening === null) {
              data[i].devaluationOpening = 0;
            }

            if (data[i].devaluationMovement === null) {
              data[i].devaluationMovement = 0;
            }

            data[i].devaluationClosing = data[i].devaluationOpening + data[i].devaluationMovement;

            data[i].closingNetBalance = data[i].closingGrossBalance + data[i].devaluationClosing;
            

            if (data[i].movementPL === null) {
              data[i].movementPL = 0;
            }

            if (data[i].movementBS === null) {
              data[i].movementBS = 0;
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

          oModel.getData()[data.length - 1] = oTotale;

          oModel.refresh();
        },

        onValueChanged: function (oEvent) {
          var path = oEvent
            .getSource()
            .getParent()
            .getBindingContext("oModelDT")
            .getPath()
            .substring(1);
          this.getView().getModel("oModelDT").getData()[path].updated = true;
          this.getView().getModel("oModelDT").getData()[path].state = "Warning";
        },

        onPressSave: function (oEvent) {
          this.onOpenBusyDialog();
          var modello = this.getView().getModel("oModelDT").getData();
          var array = [];
          array = modello.filter((item) => item.updated === true);
          var computation = modello[0].computationId;
          var imposta = modello[0].imposta;
          var that = this;

          var oObject = { ID: computation, imposta: imposta };

          if (array.length > 0) {
            for (var i = 0; i < array.length; i++) {
              var codiceRipresa = array[i].codiceRipresa;
              var devaluationMovement = parseFloat(
                array[i].devaluationMovement
              );
              var movementBS = parseFloat(array[i].movementBS);

              var indice = that
                .getView()
                .getModel("oModelDT")
                .getData()
                .findIndex((x) => x.codiceRipresa === codiceRipresa);
              var them = that;

              var nuovoDTA = JSON.stringify({
                devaluationMovement: devaluationMovement,
                movementBS: movementBS,
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
                data: nuovoDTA,
                async: false,
                success: function (oCompleteEntry) {
                  them.getView().getModel("oModelDT").getData()[indice].state =
                    "Success";
                  them.getView().getModel("oModelDT").getData()[
                    indice
                  ].updated = false;
                },
                error: function (error) {
                  them.getView().getModel("oModelDT").getData()[indice].state =
                    "Error";
                },
              });
            }

            this._setTotali();
            this.onCloseBusyDialog();
          } else {
            sap.m.MessageToast.show(
              this.getResourceBundle().getText("valorizzareRecord")
            );
            this.onCloseBusyDialog();
          }
        },
      }
    );
  }
);
