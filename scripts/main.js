function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

function sortObject(o) {
    var sorted = {},
        key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

function TDXML2JSON(oXMLNode) {
    // default value for empty elements; it could be replaced with "null" instead of "true"... but i prefer so, because the truth is what appears :-)
    var vResult = true;
    // node attributes
    if (oXMLNode.attributes && oXMLNode.attributes.length > 0) {
        var iAttrib;
        vResult = {};
        vResult["attributes"] = {};
        for (var iAttrId = 0; iAttrId < oXMLNode.attributes.length; iAttrId++) {
            iAttrib = oXMLNode.attributes.item(iAttrId);
            vResult["attributes"][iAttrib.nodeName] = iAttrib.nodeValue;
        }
    }
    // children
    if (oXMLNode.hasChildNodes()) {
        var iKey, iValue, iXMLChild;
        if (vResult === true) {
            vResult = {};
        } // if above you have changed the default value, then it must be also replaced within this "if statement" in the same way...
        for (var iChild = 0; iChild < oXMLNode.childNodes.length; iChild++) {
            iXMLChild = oXMLNode.childNodes.item(iChild);
            if ((iXMLChild.nodeType & 7) === 1) { // nodeType is "Document" (9) or "Element" (1)
                iKey = iXMLChild.nodeName;
                iValue = TDXML2JSON(iXMLChild);
                if (vResult.hasOwnProperty(iKey)) {
                    if (vResult[iKey].constructor !== Array) {
                        vResult[iKey] = [vResult[iKey]];
                    }
                    vResult[iKey].push(iValue);
                } else {
                    vResult[iKey] = iValue;
                }
            } else if ((iXMLChild.nodeType - 1 | 1) === 3) { // nodeType is "Text" (3) or "CDATASection" (4)
                iKey = "content";
                iValue = iXMLChild.nodeType === 3 ? iXMLChild.nodeValue.replace(/^\s+|\s+$/g, "") : iXMLChild.nodeValue;
                if (vResult.hasOwnProperty(iKey)) {
                    vResult[iKey] += iValue;
                }
                else if (iXMLChild.nodeType === 4 || iValue !== "") {
                    vResult[iKey] = iValue;
                }
            }
        }
    }
    return (vResult);
}

function myFunction() {
    var oMyObject = TDXML2JSON($.parseXML(document.outputForm.inputbox.value));

    var rootNode = (oMyObject.TR && oMyObject.TR.TD) || oMyObject.TD

    var resultSet = null;
    var eachtd = null;

    this.headername = function (p) {
        try {
            p.headerName = eachtd.NOBR.LABEL.content;
        } catch (error) {

        }
    }

    this.field = function (p) {
        if (eachtd.attributes.FIELD) p.field = eachtd.attributes.FIELD;
    }

    this.termCode = function (p) {
        try {
            p.termCode = eachtd.NOBR.LABEL.attributes.TERMCODE;
        } catch (error) {

        }
    }

    this.dataType = function (p) {
        if (eachtd.attributes.DATATYPE) p.dataType = eachtd.attributes.DATATYPE;
    }

    this.format = function (p) {
        if (eachtd.attributes.FORMAT) p.format = eachtd.attributes.FORMAT;
    }

    this.colId = function (p) {
        if (eachtd.attributes.ID) p.colId = eachtd.attributes.ID;
        try {
            if (eachtd.NOBR.LABEL.attributes.ID) {
                if (eachtd.attributes.ID) {
                    p.labelId = eachtd.NOBR.LABEL.attributes.ID;
                }
                else {
                    p.colId = eachtd.NOBR.LABEL.attributes.ID;
                }
            }
        } catch (error) {

        }
    }

    this.cellRenderer = function (p) {
        try {
            switch (eachtd.attributes.DATATYPE) {
                case "number":
                    if (eachtd.attributes.FORMAT == "###,##0.00;(###,##0.00)") {
                        p.dataType = "currency";
                        p.cellRenderer = "[[gridRenderFactory.cellRenderer('currency')]]";
                    }
                    p.valueGetter = "[[gridRenderFactory.cellRenderer('number')]]";
                    p.filter = "number";
                    break;
                case "date":
                    var p2 = $.extend({}, p);
                    p2.valueGetter = "[[gridRenderFactory.valueGetter('date', {originalDateFieldName: '" + p2.field + "'})]]";
                    p2.field = p2.field + "_filter_field";
                    p2.comparator = "[[coreService.comparators.dateComparator]]"
                    p.hide = true;
                    resultSet.push(sortObject(p2));

            }
        }
        catch (e) {
        }
    }

    this.sum = function (p) {
    }
    this.headerClass = function (p) {
    }
    this.headerClass = function (p) {
    }


    var booom = function (eachtd) {
        //p.headerName = eachtd.NOBR.LABEL.content;
        this.headername(p);
        this.field(p)

        //p.termCode = eachtd.NOBR.LABEL.attributes.TERMCODE;
        this.termCode(p);
        this.dataType(p);
        this.format(p);
        this.colId(p);
        if (eachtd.attributes && eachtd.attributes.TOTAL && eachtd.attributes.TOTAL === 'yes') {
            p.sum = true;
        }
        if (eachtd.attributes && eachtd.attributes.ALIGN) {
            p.headerClass = 'text' + '-' + eachtd.attributes.ALIGN.toLowerCase();
            p.cellClass = 'text' + '-' + eachtd.attributes.ALIGN.toLowerCase();
        }

        //note: this needs to be the last
        this.cellRenderer(p);
    };

    if (rootNode.length) {
        //need to loop
        var len = rootNode.length;
        resultSet = [];

        for (var i = 0; i < len; i++) {
            eachtd = rootNode[i];

            var p = {};

            booom(eachtd);

            if (!isEmpty(p))
                resultSet.push(sortObject(p));
        }
    }
    else {
        var p = {};

        /*
         assume you copy the single td node for convertion
         */
        eachtd = oMyObject.TD

        booom();

        resultSet = sortObject(p);

    }

    var gridOptions =  {
        headerCellRenderer: "[[gridRenderFactory.headerRenderer]]",
        columnDefs: resultSet,
        rowSelection: 'single',
        enableFilter: true,
        overlayNoRowsTemplate: "[[coreConstant.template.noRecordFound]]",
        overlayLoadingTemplate: "[[coreConstant.template.loading]]",
        rowData: []
    };
    // converts the resultant object to a string and displays it in a textarea
    var returnResult = JSON.stringify(gridOptions, null, 2);
    returnResult = returnResult.replace(/\"\[\[(.*)\]\]\"/ig, "$1");

    document.outputForm.outputBox.value = returnResult;
}
