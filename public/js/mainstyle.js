for (var i = 0; i <= 11; i++) {
    const element = document.getElementById(`property_group${i}`)
    element.onclick = (e) => {
        let x = e.target.parentNode.children[1]
        if (!e.target.id || !e.target.id.includes('property_group')) {
            x = e.target.parentNode.parentNode.children[1]
        }
        try {
            if (x.style.display != 'none') {
                x.style.display = 'none'
            }
            else {
                x.style.display = 'block'
            }
        } catch (error) {
            console.log(error)
        }
    }
}