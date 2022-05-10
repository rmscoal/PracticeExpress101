function searchKBBI (word, searchCount) {
    var results = document.getElementById('results-container');
    var histories = document.getElementById('history-container');
    var resultDiv = document.createElement('div');
    var historyBox = document.createElement('div');
    var artiDiv = document.createElement('div');

    resultDiv.setAttribute("class","result-box");
    resultDiv.setAttribute("id", searchCount);
    historyBox.setAttribute("class", "history-box");
    artiDiv.setAttribute("class","arti-box");

    const url = 'https://new-kbbi-api.herokuapp.com/cari/'+word;

    fetch(url).then((response) => {
        if (!response.ok) { // mengecek respon
            // menampilkan error div
            if (results.firstChild === null) results.style.display = 'block';

            // buat h4 mengatakan error 
            var errorH4 = document.createElement('h4');
            var errorP = document.createElement('p');
            errorH4.style.color = 'red';
            errorH4.innerHTML = 'Error!'
            errorP.innerHTML = "Kata tidak ditemukan atau terkena limit."

            // append errorH4 to the result-box
            resultDiv.append(errorH4, errorP); 
        
            // append the result-box to the results-container
            results.insertBefore(resultDiv, results.firstChild);

             // for error words 
            if (histories.firstChild === null) histories.style.display = "flex"; 
            var historyP = document.createElement('a');
            historyP.href = 'http://localhost:8080/home#'+searchCount; 
            historyP.style.color = "red";
            historyP.innerHTML = word; 
            historyBox.appendChild(historyP);

            histories.insertBefore(historyBox, histories.firstChild);
        }
        return response.json();
    })
    .then(data => {
        const dataGET = [...data.data]; // dataGET merupakan array

        // pembersihan dan menghasilkan lema
        const lema = dataGET[0].lema; // lema merupakan string
        dataGET[0].lema = cleanUpWordWithNumber(lema);  // pembersihan kata dari lema yang memiliki
                                                        // integer didalamnya

        // ini adalah <div> untuk results
        if (results.firstChild === null) results.style.display = 'block';

        // the creation of lema div and its components
        var lemmaDiv = document.createElement('div');
        lemmaDiv.className = 'lema';
        var lemmaH4 = document.createElement('h4');
        lemmaH4.innerHTML = 'Lema';
        var lemmaP = document.createElement('p');
        lemmaP.innerHTML = cleanUpWordWithNumber(dataGET[0].lema);

        // appending the lema child nodes
        lemmaDiv.append(lemmaH4, lemmaP);

        // ini bagian membuat <h4> dan <p> untuk arti tergantung dengan banyaknya arti
        let count = dataGET[0].arti.length;

        for  (let i = 1; i <= count; i++) {
            var artiH4 = document.createElement('h4');
            count === 1 ? artiH4.innerHTML = 'Arti:' : artiH4.innerHTML = `Arti ke-${i}:`;

            var artiP = document.createElement('p');
            artiP.innerHTML = dataGET[0].arti[i-1].deskripsi; 

            artiDiv.append(artiH4, artiP);
            
        } 

        // append lema div to result-box
        resultDiv.append(lemmaDiv, artiDiv);

        //prepend result box div into results-container
        results.insertBefore(resultDiv, results.firstChild);

        // making history div
        if (histories.firstChild === null) histories.style.display = "flex"; 
        var historyP = document.createElement('a');
        historyP.href = 'http://localhost:8080/home#'+searchCount;
        historyP.innerHTML = word; 
        historyBox.appendChild(historyP);

        histories.insertBefore(historyBox, histories.firstChild);

    })
    .catch( err => {
        console.log('Error message: ' + err.message);
    });
}

function getUsername (username) {
    username = username.substr(8);
    username = username.substr(0, username.length-5);

    return username;
}


// fungsi untuk membersihkan lema jika terdapat suatu angka di dalamnya
const cleanUpWordWithNumber = (word) => {
    for (let i=0; i < word.length; i++) { // mengiterasi seluruh string di lema
        const checker = Number.parseInt(word[i], 10); // mencoba untuk mengubahnya ke dalam Number
        if (isNaN(checker)) continue; // jika hasilnya isNaN maka lanjutkan... berarti bukan Number
        else {
            word = word.replace(word[i],''); // jika tidak, maka word ke-i merupakan angka dan
                                            // akan dibuang dari word
        };
    }
    return word; // return hasil
};


window.onload = function () {
    var usernameHeader = document.getElementsByClassName('header'); 
    var username = usernameHeader[0].firstElementChild.innerHTML;
    username = getUsername(username);

    searchCount = 1; 
    // this will trigger the searchKBBI function
    var keyInput = document.getElementById('input');
    keyInput.onkeydown = function (e) {
        if (!e) e = window.event;
        var keyCode = e.code || e.key;
        if (keyCode == 'Enter'){
            searchKBBI(this.value, searchCount);
            searchCount++;
        }
    }
}
