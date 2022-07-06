sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "./BaseController",
    "sap/m/library",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (JSONModel, Fragment, BaseController, mobileLibrary) {
    "use strict";
    var codiceGL;
    var ripresaID;
    var versioneID;
    var configurazioneID;
    var computazioneID;
    var descrizioneGL;
    var URLHelper = mobileLibrary.URLHelper;
    var file;
    var imposta;
    var allegatoID;

    return BaseController.extend(
      "tax.provisioning.computations.controller.Allegati",
      {
        onInit: function () {
          this.getOwnerComponent()
            .getRouter()
            .getRoute("Allegati")
            .attachPatternMatched(this._onObjectMatched, this);
          sap.ui.getCore().sapAppID = this.getOwnerComponent()
            .getMetadata()
            .getManifest()["sap.app"].id;
        },

        _setTableAllegati: function (
          ripresaID,
          codiceGL,
          computazioneID,
          imposta
        ) {
          var that = this;
          var codiceGL = codiceGL;
          var ripresaID = ripresaID;
          var computazioneID = computazioneID;
          var testata = [codiceGL];

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/AllegatiRipresa?$expand=computation,ripresa&$filter=computation_ID eq " +
                computazioneID +
                " and ripresa_ID eq '" +
                ripresaID +
                "' and codiceGL eq '" +
                codiceGL +
                "' and imposta eq '" +
                imposta +
                "'"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var linkArray = [];
              for (var i = 0; i < oCompleteEntry.value.length; i++) {
                linkArray.push(oCompleteEntry.value[i].ID);
              }
              var oData = {
                oModel: oCompleteEntry.value,
                oModelTestata: testata,
                oModelLink: linkArray,
              };
              var oModel = new JSONModel(oData);
              that.getView().setModel(oModel, "oModelTableAllegati");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _onObjectMatched: function (oEvent) {
          var oEvent = oEvent.getParameter("arguments");
          computazioneID = oEvent.ID;
          codiceGL = oEvent.codiceGL;
          ripresaID = oEvent.ripresaID;
          imposta = oEvent.imposta;

          this.getView().setModel(
            new JSONModel({
              ID: computazioneID,
              ripresaID: ripresaID,
              codiceGL: codiceGL,
              imposta: imposta,
            }),
            "routingModel"
          );

          this._setTableAllegati(ripresaID, codiceGL, computazioneID, imposta);
        },

        onSaveAllegato: function (oEvent) {
          if (this._validazioneAllegato()) {
            var nuovoAllegato;
            var fileName = this.getView().byId("fileUploader").getValue();

            if (this.getView().byId("nota").getValue()) {
              nuovoAllegato = JSON.stringify({
                descrizione: this.getView()
                  .byId("descrizioneAllegato")
                  .getValue(),
                importo: parseFloat(
                  this.getView().byId("importoAllegato").getValue()
                ),
                computation_ID: computazioneID,
                ripresa_ID: ripresaID,
                codiceGL: codiceGL,
                fileName: fileName,
                imposta: this.getView().getModel("routingModel").getData()
                  .imposta,
                note: [{ nota: this.getView().byId("nota").getValue() }],
              });
            } else {
              nuovoAllegato = JSON.stringify({
                descrizione: this.getView()
                  .byId("descrizioneAllegato")
                  .getValue(),
                importo: parseFloat(
                  this.getView().byId("importoAllegato").getValue()
                ),
                computation_ID: computazioneID,
                ripresa_ID: ripresaID,
                codiceGL: codiceGL,
                fileName: fileName,
                imposta: this.getView().getModel("routingModel").getData()
                  .imposta,
              });
            }

            var that = this;

            jQuery.ajax({
              url: jQuery.sap.getModulePath(
                sap.ui.getCore().sapAppID + "/catalog/AllegatiRipresa"
              ),
              contentType: "application/json",
              type: "POST",
              data: nuovoAllegato,
              async: false,
              success: function (oCompleteEntry) {
                var ID = oCompleteEntry.ID; //allegatoID
                if (fileName) {
                  that._putAllegato(ID);
                }
                that.onCloseAllegato();
              },
              error: function (error) {
                sap.m.MessageToast.show("Error");
              },
            });
          } else {
            sap.m.MessageToast.show(
              this.getResourceBundle().getText("campiObbligatoriLabel")
            );
          }
        },

        onNewAllegatoPress: function (oEvent) {
          var oView = this.getView();
          if (!this._pDialogConf) {
            this._pDialogConf = Fragment.load({
              id: oView.getId(),
              name: "tax.provisioning.computations.view.fragment.NuovoAllegato",
              controller: this,
            }).then(function (oDialogConf) {
              oView.addDependent(oDialogConf);
              return oDialogConf;
            });
          }
          this._pDialogConf.then(function (oDialogConf) {
            //this._configDialog(oButton, oDialogConf);
            oDialogConf.open();
          });
        },

        onNotePress: function (oEvent) {
          allegatoID = oEvent
            .getSource()
            .getParent()
            .getBindingContext("oModelTableAllegati")
            .getObject().ID;
          this._setTimeline(allegatoID);
          var oView = this.getView();
          if (!this._pDialogNote) {
            this._pDialogNote = Fragment.load({
              id: oView.getId(),
              name: "tax.provisioning.computations.view.fragment.Note",
              controller: this,
            }).then(function (pDialogNote) {
              oView.addDependent(pDialogNote);
              return pDialogNote;
            });
          }
          this._pDialogNote.then(function (pDialogNote) {
            pDialogNote.open();
          });
        },

        onCloseAllegato: function (oEvent) {
          this.byId("DialogNuovoAllegato").close();
          this.byId("fileUploader").clear();
          this.byId("descrizioneAllegato").setValue("");
          this.byId("importoAllegato").setValue("");
          this.byId("nota").setValue("");
          this._setTableAllegati(ripresaID, codiceGL, computazioneID, imposta);
        },

        onCloseNote: function () {
          this.byId("DialogNote").close();
        },

        onNavBack: function (oEvent) {
          this.getRouter().navTo("Riprese", {
            ripresaID: ripresaID,
            ID: computazioneID,
            imposta: this.getView().getModel("routingModel").getData().imposta,
          });
        },

        change: function (oEvent) {
          this.getView().byId("fileUploader");
          file = oEvent.getParameters("files").files[0];
        },

        onPost: function (oEvent) {
          var sNota = oEvent.getSource().getProperty("value");
          var oBody = JSON.stringify({
            allegatoRipresa_ID: allegatoID,
            nota: sNota,
          });
          var that = this;
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID + "/catalog/AllegatiRipresaNote"
            ),
            contentType: "application/json",
            type: "POST",
            data: oBody,
            async: false,
            success: function (oCompleteEntry) {
              that.onCloseNote();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _putAllegato: function (ID, nuovoAllegato) {
          var that = this;
          var allegatoID = ID;
          var allegato = nuovoAllegato;
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/AllegatiRipresa/" +
                allegatoID +
                "/content"
            ),
            contentType: false,
            type: "PUT",
            data: file,
            processData: false,
            async: false,
            success: function (oCompleteEntry) {
              sap.m.MessageToast.show("Success");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _linkAllegati: function (oEvent) {
          var allegatoID = oEvent
            .getSource()
            .getBindingContext("oModelTableAllegati")
            .getObject().ID;

          var url = jQuery.sap.getModulePath(
            sap.ui.getCore().sapAppID +
              "/catalog/AllegatiRipresa/" +
              allegatoID +
              "/content "
          );
          URLHelper.redirect(url, true);
        },

        _validazioneAllegato: function () {
          var oDescriptionAllegato = this.getView().byId("descrizioneAllegato");
          var oImportoAllegato = this.getView().byId("importoAllegato");
          var oNota = this.getView().byId("nota");
          var oFile = this.getView().byId("fileUploader");

          oDescriptionAllegato.setValueState();
          oImportoAllegato.setValueState();
          oNota.setValueState();
          oFile.setValueState();

          if (!oDescriptionAllegato.getValue()) {
            oDescriptionAllegato.setValueState("Error");
          }
          if (!oImportoAllegato.getValue()) {
            oImportoAllegato.setValueState("Error");
          }
          if (!oNota.getValue() && !oFile.getValue()) {
            oNota.setValueState("Error");
            oFile.setValueState("Error");
          }
          if (
            oDescriptionAllegato.getValue() &&
            oImportoAllegato.getValue() &&
            (oNota.getValue() || oFile.getValue())
          )
            return true;
          else return false;
        },
        _setTimeline: function (allegatoID) {
          var that = this;
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/AllegatiRipresaNote?$filter=allegatoRipresa_ID eq " +
                allegatoID
            ),
            contentType: "application/json",
            type: "GET",
            async: false,
            success: function (oCompleteEntry) {
              var oModel = new JSONModel(oCompleteEntry.value);
              that.getView().setModel(oModel, "oModelNote");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },
      }
    );
  }
);
