import { fetchJSON } from "./functions/api.js"

class InfinitePagination {

    /** @type {string} */
    #endpoint
    /** @type {HTMLTemplateElement} */
    #template
    /** @type {HTMLElement} */
    #target
       /** @type {HTMLElement} */
    #loader
    /** @type {object} */
    #elements
    /** @type {IntersectionObserver} */
    #observer
    /** @type {boolean} */
    #loading
    /** @type {number} */
    #page = 1

    /**
     * @param {HTMLElement} element 
     */
    constructor (element) {
        this.#loader = element
        this.#endpoint = element.dataset.endpoint
        this.#template = document.querySelector(element.dataset.template)
        this.#target = document.querySelector(element.dataset.target)
        this.#elements = JSON.parse(element.dataset.elements)
        this.#observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    this.#loadMore()
                }
            }
        })
        this.#observer.observe(element)
    }

    async #loadMore() {
        if (this.#loading) {
            return 
        }
        this.#loading = true
        const url = new URL(this.#endpoint)
        url.searchParams.set('_page', this.#page)
        const comments = await fetchJSON(url.toString())
        if (comments.length === 0) {
            this.#observer.disconnect()
            this.#loader.remove()
            return
        }
        //const elementsMap = JSON.parse(this.#elements)
        for (const comment of comments) {
            const commentElement = this.#template.content.cloneNode(true)
            for (const [key, selector] of Object.entries(this.#elements)) {
                commentElement.querySelector(selector).innerText = comment[key]
            }
            // Injecter les données
            //commentElement.querySelector(elementsMap.name).textContent = comment.name
            //commentElement.querySelector(elementsMap.body).textContent = comment.body

            this.#target.append(commentElement)
        }
        this.#page++
        this.#loading = false
    }


}

document
    .querySelectorAll('.js-infinite-pagination')
    .forEach(el => new InfinitePagination(el))