const Flight_STORAGE_KEY = 'flight-list'
export default {
    fetch() {
        return JSON.parse(window.localStorage.getItem(Flight_STORAGE_KEY) || '[]')
    },
    save(items) {
        window.localStorage.setItem(Flight_STORAGE_KEY, JSON.stringify(items))
    },
    add(item) {
        let list = this.fetch();
        list.push(item);
        this.save(list);
    },
    delete(id) {
        let paths = this.fetch();
        paths.forEach((path, i) => {
            if (path.id === id) {
                paths.splice(i, 1);
            }
        });
        this.save(paths);
    },
    update(id, item) {
        let items = this.fetch();
        items.forEach((p, i) => {
            if (p.id === id) {
                items.splice(i, 1, item);
            }
        })
        this.save(items);
    }
}
