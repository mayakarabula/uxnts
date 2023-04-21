let output = ''
let error = ''

export const out = (c: string) => {
    output += c;

    const element = document.getElementById('stdout');
    if (element) {
        element.textContent = output;
    }
}

export const outError = (c: string) => {
    error += c;

    const element = document.getElementById('stderr');
    if (element) {
        element.textContent = error;
    }
}