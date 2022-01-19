function closeAlert(e) {
    e.target.parentNode.classList.toggle('closed');
    setTimeout(function () { e.target.parentNode.remove(); }, 650);
}

export function showAlert(type, msg) {

    const alert = document.createElement('div');
    alert.style.display = "block";
    alert.className = `alert ${type}`;
    let container = document.querySelector('body');
    let message = document.createElement('div');
    message.className = 'message';
    let title = document.createElement('h2')
    title.innerText = type
    alert.appendChild(title)
    message.innerText = msg;
    alert.appendChild(message);
    let close = document.createElement('span');
    close.className = 'alert-close';
    close.innerHTML = `&#10006;`;
    close.addEventListener('click', closeAlert);
    alert.appendChild(close);
    container.appendChild(alert);

    setTimeout(function () {
        alert.classList.toggle('show');
    }, 100);
    setTimeout(function () {
        alert.classList.remove('show');
    }, 3500);
}    