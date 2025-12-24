document.addEventListener('DOMContentLoaded', () => {
    const html_and_css = document.getElementById('html_and_css')
    const copy = document.getElementById('copy')
    html_and_css.addEventListener('click', getallcode)
    copy.addEventListener('click', copycode)
    getallcode()
})
function getallcode() {
    code.textContent = ''
    let the_code = ''
    const result = localStorage.getItem('UIExpertcode')
    for (let i = 0; i < result.length; i++) {
        the_code += result[i]
    }
    code.textContent = the_code
    hljs.highlightAll()
}
function copycode() {
    const tempTextArea = document.createElement('textarea')
    tempTextArea.value = code.textContent
    document.body.appendChild(tempTextArea)
    tempTextArea.select()
    document.execCommand('copy')
    document.body.removeChild(tempTextArea)
    const note = document.getElementById('copy-toast')
    note.classList.add('show')
    setTimeout(() => {
        note.classList.remove('show')
    }, 1500);
}