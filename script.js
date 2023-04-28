// Copyright © 2022 DocuSign, Inc.
// License: MIT Open Source https://opensource.org/licenses/MIT

import {
    CallApi,
    ImplicitGrant,
    UserInfo
    // View the source at https://codepen.io/docusign/pen/LYBKqxb
} from "https://codepen.io/docusign/pen/LYBKqxb.js";
import {
    msg,
    htmlMsg,
    adjustRows,
    errMsg,
    workingUpdate,
    usingHttps
    // View the source at https://codepen.io/docusign/pen/QWBXYzX
} from "https://codepen.io/docusign/pen/QWBXYzX.js";

$(function () {
    // Set basic variables
    const dsReturnUrl = "https://docusign.github.io/jsfiddleDsResponse.html";
    const logLevel = 0; // 0 is terse; 9 is verbose
    let signingCeremonyWindow = null;

    // Example settings
    const docUrl = "https://docusign.github.io/examples/docs/anchorfields.pdf";
    const docViewUrl =
        "https://docusign.github.io/examples/docs/anchorfields_view.pdf";

    debugger; // uncomment with debugger open to find the right JS file.

    /*
     * The doit function is the example that is triggered by the
     * button. The user is already logged in (we have an access token).
     */
    let doit = async function doitf(event) {
        $("#doit").addClass("hide");
        if (!checkToken()) {
            // Check that we have a valid token
            return;
        }
        workingUpdate(true);
        const signer = {
            name: data.userInfo.name,
            email: data.userInfo.email,
            clientUserId: 1000
        };
        const envelopeId = await createEnvelope(signer);
        if (envelopeId) {
            msg(`Envelope ${envelopeId} created.`);
            await embeddedSigningCeremony({
                envelopeId: envelopeId,
                signer: signer
            });
        }
        $("#doit").removeClass("hide");
        workingUpdate(false);
    };
    doit = doit.bind(this);

    /*
     *  Create the envelope by completely specifying the envelope.
     *  Often the recommended alternative is to first create a template
     *  on the DocuSign platform, then reference the template when
     *  creating the envelope. See the other examples...
     */
    async function createEnvelope({ name, email, clientUserId }) {
        const docB64 = await data.callApi.getDocB64(docUrl); // fetch a document

        const req = {
            emailSubject: "Please sign the attached document",
            status: "sent",
            customFields: {
                listCustomFields: [
                    {
                        name: "Envelope list custom field 1",
                        show: "true",
                        value: "value 1"
                    },
                    {
                        name: "Envelope list custom field 2",
                        show: "true",
                        value: "value 2"
                    }
                ],
                textCustomFields: [
                    {
                        name: "Envelope text custom field 1",
                        show: "true",
                        value: "value 1"
                    },
                    {
                        name: "Envelope text custom field 2",
                        show: "true",
                        value: "value 2"
                    }
                ]
            },
            documents: [
                {
                    name: "Example document",
                    documentBase64: docB64,
                    fileExtension: "pdf",
                    documentId: "1",
                    documentFields: [
                        {
                            name: "doc field 1",
                            value: "val 1"
                        },
                        {
                            name: "doc field 2",
                            value: "val 2"
                        }
                    ]
                }
            ],
            recipients: {
                signers: [
                    {
                        email: email,
                        name: name,
                        clientUserId: clientUserId,
                        customFields: ["field1: value 1", "field2: value 2"],
                        recipientId: "1",
                        tabs: {
                            signHereTabs: [
                                {
                                    anchorString: "/sig1/",
                                    anchorXOffset: "20",
                                    anchorUnits: "pixels"
                                }
                            ],
                            checkboxTabs: [
                                {
                                    anchorString: "/sig1/",
                                    anchorXOffset: "180",
                                    anchorUnits: "pixels",
                                    tabLabel: "checkbox 1",
                                    tabGroupLabels: ["checkbox group"]
                                },
                                {
                                    anchorString: "/sig1/",
                                    anchorXOffset: "180",
                                    anchorYOffset: "20",
                                    anchorUnits: "pixels",
                                    tabLabel: "checkbox 2",
                                    tabGroupLabels: ["checkbox group"]
                                }
                            ],
                            tabGroups: [
                                {
                                    groupLabel: "checkbox group",
                                    groupRule: "SelectExactly",
                                    minimumRequired: "1",
                                    maximumAllowed: "1",
                                    validationMessage:
                                        "Please check one option",
                                    tabScope: "document",
                                    pageNumber: "1",
                                    documentId: "1"
                                }
                            ],
                            textTabs: [
                                {
                                    anchorString: "/sig1/",
                                    anchorXOffset: "195",
                                    anchorUnits: "pixels",
                                    value: "I agree with license 1",
                                    locked: "true",
                                    font: "Helvetica",
                                    fontSize: "Size12",
                                    bold: "true"
                                },
                                {
                                    anchorString: "/sig1/",
                                    anchorXOffset: "195",
                                    anchorYOffset: "20",
                                    anchorUnits: "pixels",
                                    value: "I agree with license 2",
                                    locked: "true",
                                    font: "Helvetica",
                                    fontSize: "Size12",
                                    bold: "true"
                                },
                                {
                                    anchorString: "/sig1/",
                                    anchorXOffset: "20",
                                    anchorYOffset: "50",
                                    anchorUnits: "pixels",
                                    bold: "true",
                                    font: "Helvetica",
                                    fontSize: "Size14",
                                    fontColor: "NavyBlue",
                                    value:
                                        "Addendum\n‣ Item 1\n‣ Item 2\nThis is a multi-line read-only text field"
                                }
                            ]
                        }
                    }
                ]
            }
        };

        // Make the create envelope API call
        msg(`Creating envelope.`);
        const apiMethod = `/accounts/${data.userInfo.defaultAccount}/envelopes`;
        const httpMethod = "POST";
        const results = await data.callApi.callApiJson({
            apiMethod: apiMethod,
            httpMethod: httpMethod,
            req: req
        });
        if (results === false) {
            errMsg(data.callApi.errMsg);
            return false;
        }
        if (logLevel > 0) {
            htmlMsg(
                `<p>Envelope created. Response:</p><p><pre><code>${JSON.stringify(
                    results,
                    null,
                    4
                )}</code></pre></p>`
            );
        }
        return results.envelopeId;
    }

    /*
     * Create an embedded signing ceremony, open a new tab with it
     */
    async function embeddedSigningCeremony({ envelopeId, signer }) {
        const req = {
            returnUrl: dsReturnUrl,
            authenticationMethod: "None",
            clientUserId: signer.clientUserId,
            email: signer.email,
            userName: signer.name
        };

        // Make the API call
        const apiMethod = `/accounts/${data.userInfo.defaultAccount}/envelopes/${envelopeId}/views/recipient`;
        const httpMethod = "POST";
        const results = await data.callApi.callApiJson({
            apiMethod: apiMethod,
            httpMethod: httpMethod,
            req: req
        });
        if (results === false) {
            errMsg(data.callApi.errMsg);
            return false;
        }
        if (logLevel > 5) {
            htmlMsg(
                `<p>Embedded Signing Ceremony created. Response:</p><p><pre><code>${JSON.stringify(
                    results,
                    null,
                    4
                )}</code></pre></p>`
            );
        }
        msg(`Displaying signing ceremony...`);
        signingCeremonyWindow = window.open(results.url, "_blank");
        if(!signingCeremonyWindow || signingCeremonyWindow.closed || 
           typeof signingCeremonyWindow.closed=='undefined') {
            // popup blocked
            alert ("Please enable the popup window signing ceremony");
        }
        signingCeremonyWindow.focus();
        return true;
    }

    /*
     * signingCeremonyEnded
     * After the signing ceremony ends (in its own tab),
     * the browser tab is redirected to the returnUrl, defined
     * in constant dsReturnUrl.
     * Source:
     * https://github.com/docusign/docusign.github.io/blob/master/jsfiddleDsResponse.html
     *
     * That page runs Javascript to send a message via window.postMessage.
     * The message is tagged with source `dsResponse`.
     * The function messageListener (in mainline section) receives and
     * dispatches the different types of incoming messages.
     * When a dsResponse message is received, this function is called.
     */
    function signingCeremonyEnded(data) {
        if (data.source !== "dsResponse") {
            return; // Sanity check
        }
        signingCeremonyWindow.close(); // close the browser tab
        const href = data.href; // "http://localhost:3000/?event=signing_complete"
        const sections = href.split("?");
        const hasEvents = sections.length === 2;
        const qps = hasEvents ? sections[1].split("&") : [];
        if (!hasEvents) {
            errMsg(`Unexpected signing ceremony response: ${data.href}.`);
            return;
        }
        let msg = `<p><b>Signing Ceremony Response</b><br/>`;
        msg += `<small>Information Security tip: do not make business decisions based on this data since they can be spoofed. Instead, use the API.</small>`;

        qps.forEach((i) => {
            const parts = i.split("=");
            msg += `<br/>Query parameter <b>${parts[0]} = "${parts[1]}"</b>`;
        });
        msg += "</p>";
        htmlMsg(msg);
    }
    
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    /* Checks that the access token is still good.
     * Prompts for login if not
     */
    function checkToken() {
        if (data.implicitGrant.checkToken()) {
            // ok
            return true;
        } else {
            // not ok
            $("#login").removeClass("hide");
            $("#doit").addClass("hide");
            // reset everything
            msg("Please login");
        }
    }
    
    /*
     * Receives and dispatches incoming messages
     */
    let messageListener = async function messageListenerf(event) {
        if (!event.data) {
            return;
        }
        const source = event.data.source;
        if (source === "dsResponse") {
            signingCeremonyEnded(event.data);
            return;
        }
        if (source === "oauthResponse" && data.implicitGrant) {
            await implicitGrantMsg(event.data);
            return;
        }
    };
    messageListener = messageListener.bind(this);

    /*
     * Process incoming implicit grant response
     */
    async function implicitGrantMsg(eventData) {
        const oAuthResponse = data.implicitGrant.handleMessage(eventData);
        if (oAuthResponse === "ok") {
            if (await completeLogin()) {
                data.loggedIn();
            }
        } else if (oAuthResponse === "error") {
            $("#login").removeClass("hide");
            const errHtml = `<p class="text-danger">${data.implicitGrant.errMsg}</p>`;
            htmlMsg(errHtml);
        }
    }

    /*
     * Complete login process including
     * Get user information
     * Set up CallApi object
     * update the user
     */
    async function completeLogin() {
        data.userInfo = new UserInfo({
            accessToken: data.implicitGrant.accessToken,
            workingUpdateF: workingUpdate
        });
        const ok = await data.userInfo.getUserInfo();
        if (ok) {
            data.callApi = new CallApi({
                accessToken: data.implicitGrant.accessToken,
                apiBaseUrl: data.userInfo.defaultBaseUrl
            });
            if (logLevel === 0) {
                htmlMsg(
                    `<p><b>${data.userInfo.name}</b><br/>` +
                        `${data.userInfo.email}<br/>` +
                        `${data.userInfo.defaultAccountName}</p>`
                );
            } else {
                htmlMsg(
                    `<p><b>OAuth & UserInfo Results</b><br/>` +
                        `Name: ${data.userInfo.name}` +
                        ` (${data.userInfo.userId})<br/>` +
                        `Email: ${data.userInfo.email}<br/>` +
                        `Default account: ${data.userInfo.defaultAccountName}` +
                        ` (${data.userInfo.defaultAccount})<br/>` +
                        `Base URL: ${data.userInfo.defaultBaseUrl}</p>`
                );
            }
        } else {
            // Did not complete the login
            $("#login").removeClass("hide");
            const errHtml = `<p class="text-danger">${data.userInfo.errMsg}</p>`;
            htmlMsg(errHtml);
        }
        return ok;
    }

    /*
     * Login button was clicked
     */
    let login = async function loginf(event) {
        $("#login").addClass("hide");
        await data.implicitGrant.login();
    };
    login = login.bind(this);

    // Mainline
    let data = {
        implicitGrant: null,
        userInfo: null,
        callApi: null,
        loggedIn: () => $("#doit").removeClass("hide")
    };

    // The mainline
    if (usingHttps()) {
        adjustRows();
        data.implicitGrant = new ImplicitGrant({
            workingUpdateF: workingUpdate
        });

        window.addEventListener("message", messageListener);
        $("#btnOauth").click(login);
        $("#btnDoit").click(doit);
    }
});
