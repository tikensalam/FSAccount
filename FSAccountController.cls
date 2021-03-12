public with sharing class FSAccountController {
    @AuraEnabled(cacheable = true)
    public static List<Account> getFSAccounts(){
        try {
                return [SELECT Id, Name, Owner.Name, Phone, Website, AnnualRevenue FROM Account WHERE Industry ='Financial Services'];
        } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
        }
    }
   
}
