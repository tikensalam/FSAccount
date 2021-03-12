import { LightningElement, track, wire } from 'lwc';
import getFSAccounts from '@salesforce/apex/FSAccountController.getFSAccounts';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from "lightning/navigation";

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ACCOUNTNAME_FIELD from '@salesforce/schema/Account.Name';
import ACCOUNTOWNER_FIELD from '@salesforce/schema/Account.Owner.Name';
import ID_FIELD from '@salesforce/schema/Account.Id';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';
import ANNUALREVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';

const columns = [
    { label: 'Account Name', fieldName: 'Name', sortable: true, editable: true, type: "button",
                typeAttributes : {label: {fieldName: 'Name'}, name: "navigateToAccount", variant: "base"}},
    { label: 'Account Owner', fieldName : 'AccountOwner', sortable: true, editable: true},
    { label: 'Phone', fieldName : 'Phone', editable: true, type: 'phone'},
    { label: 'Website', fieldName : 'Website', editable: true, type: 'url'},
    { label: 'Annual Revenue', fieldName : 'AnnualRevenue', editable: true, type: 'currency'}
];

export default class FinancialService extends NavigationMixin(LightningElement) {
    @track allAccounts=[];
    @track error;
    columns = columns;
    draftValues = [];
    searchKey;
    //defaultSortDirection = 'asc';
    @track sortDirection;
    @track sortBy;   
    currentData = [];
    /*async connectedCallback() {
        alert("callback");
    }*/
    @wire (getFSAccounts) 
    accounts ({error, data}){
        if(data){
            
            //alert("here");
            data.forEach((account) =>{
                let newData={};
                newData.Id = account.Id;
                newData.Name = account.Name;
                newData.AccountOwner = account.Owner.Name;
                newData.Phone = account.Phone;
                newData.Website = account.Website;
                newData.AnnualRevenue = account.AnnualRevenue;

                this.currentData.push(newData);
            });
            
            this.allAccounts = this.currentData;
            //alert("here2 " + JSON.stringify(currentData));
        }else if(error){
            this.error = error;
            console.log(error);
        }
    }

    handleRowAction(event) {
       
        if (event.detail.action.name === "navigateToAccount") {
            this[NavigationMixin.GenerateUrl]({
                type: "standard__recordPage",
                attributes: {
                    recordId: event.detail.row.Id,
                    actionName: "view"
                }
            }).then((url) => {
                window.open(url, "_blank");
            });
        }
    }

    handleSearch(event){
        this.searchKey = event.target.value;
        //alert(typeof(this.searchKey));
        //alert(JSON.stringify(this.allAccounts));
        //filterRows = this.allAccounts;
        if(this.searchKey){
            this.allAccounts = this.allAccounts.filter(function(acc){
                return acc.Name === "Acme";
            });
            //alert(JSON.stringify(filterRows));
        }
        //alert(JSON.stringify(this.allAccounts));
    }

    handleSave(event){
        const fields = {}; 
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[ACCOUNTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].Name;
        fields[ACCOUNTOWNER_FIELD.fieldApiName] = event.detail.draftValues[0].AccountOwner;
        fields[PHONE_FIELD.fieldApiName] = event.detail.draftValues[0].Phone;
        fields[WEBSITE_FIELD.fieldApiName] = event.detail.draftValues[0].Website;
        fields[ANNUALREVENUE_FIELD.fieldApiName] = event.detail.draftValues[0].AnnualRevenue;

        const recordInput = {fields};

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account updated',
                    variant: 'success'
                })
            );
            // Display fresh data in the datatable
            return refreshApex(this.allAccounts).then(() => {

                // Clear all draft values in the datatable
                this.draftValues = [];

            });
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    
    }


    onHandleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.allAccounts));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.allAccounts = parseData;
    }    
}
