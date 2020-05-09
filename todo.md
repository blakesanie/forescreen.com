1.  enable database counting in server, not front end. Use param value of "last" to signify last. return {companies: companies, numPages: numPages, pageReturned, pageReturned} then compare if numPages is < page. If so, set page var to numPages and disable last element;
2.  make account pages and pro page responsive

<!-- session ended:
    add customerId to users/uid
    check for payments/customerId
    if exists, add isPro to users/uid and remove from payments/customerId

subscription started:
    add to payments/customerId
    if users/uid/customerId -->
