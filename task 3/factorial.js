document.getElementById('facto').addEventListener("submit", function(event) {
    event.preventDefault();
    const num = parseInt(document.getElementById("num").value);
    const resultElement = document.getElementById("result");
    const arr= factorial(num);
    resultElement.textContent = `${arr.join('')}`;
});


function factorial(n){
    let arr = [1];
    for(let i=1; i<=n; i++){
        arr = multiply(arr,i);
    }
    return arr;
}

function multiply(arr,n){
    let carry = 0;
    let result = [];
    for(let i=arr.length-1; i>=0; i--){
        let prod = n * arr[i] +carry;
        carry = Math.floor(prod/10);
        result.unshift(prod%10);
    }
    while(carry>0){
        result.unshift(carry%10);
        carry = Math.floor(carry/10);
    }
    return result;
}