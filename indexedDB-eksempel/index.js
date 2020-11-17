/*
 *
 * qID              = int (auto increment)
 * questionText     = string
 * correctAnswer    = boolean
 * studentAnswer    = boolean
 * result           = boolean
 * 
 */

 
// Check if indexedDB is supported in the browser
if(!window.indexedDB) {
    alert("indexedDB is not supported in this browser");
}

// Open the database of version 1 and insert into variable 'request'
let request = window.indexedDB.open("QuizQuestDatabase", 1),
            db,
            tx, 
            store,
            index;

// Fire an event, whenever a new database is created
request.onupgradeneeded = function(e) {
    // Grab the database
    let db = request.result,
        // We're setting up a store and then
        // we pass in the name we're giving the store 
        store = db.createObjectStore("QuestionStore", {
            keyPath: "qID"
        }),
        // Another way to create an auto incrementing ID
        // store = db.createObjectStore("QuestionStore", {
        //    autoIncrement: true
        // })

        // Create an index of questionIndex to make searchable
        index = store.createIndex("questionText", "questionText", {unique: false}); 
}

// Once request.onupgradeneeded has run, fire this event
request.onsuccess = function(e) {
    // The result from the database in db
    db  = request.result;
    tx  = db.transaction("QuestionStore", "readwrite");
    // Grab the store
    store = tx.objectStore("QuestionStore");
    index = store.index("questionText");
    
    // Display any errors
    db.onerror = function(e) {
        console.log("ERROR: " + e.target.errorCode);
    }

    // store.put({
    //     qID: 1, 
    //     questionText: "The sky is blue.",
    //     correctAnswer: true,
    //     studentAnswer: true,
    //     result: true 
    // });

    // store.put({
    //     qID: 2, 
    //     questionText: "The grass is green.",
    //     correctAnswer: true,
    //     studentAnswer: true,
    //     result: true 
    // });

    // Retrieve data from database
    // Get the ID of 1
    let q1 = store.get(1);
    let qs = index.get("The grass is green.");

    q1.onsuccess = function() {
        console.log(q1.result);
        console.log(q1.result.questionText);
    }
    qs.onsuccess = function() {
        console.log(qs.result.questionText);
    } 

    // Close the datebase once complete
    tx.oncomplete = function() {
        db.close();
    }
}

// Creating an error handler for the database response
request.onerror = function(e) {
    // Use event object to print error
    console.log("There was an error: " + e.target.errorCode);
};




// Create handler for handling data from database, if no erros
request.onsuccess = function(e) {
     // Assagin database to db variable by asccesing request.result
     db = request.result;
}