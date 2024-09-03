import {recursion} from "../../../utils/raba_color";

const MANAGE_STORAGE_KEY = 'manage-list'
export default {
    fetch() {
        return JSON.parse(window.localStorage.getItem(MANAGE_STORAGE_KEY) || '[]')
    },
    save(items) {
        window.localStorage.setItem(MANAGE_STORAGE_KEY, JSON.stringify(items))
    },
    add(item) {
        let list = this.fetch();
        if (item.parId === '2') {
            list[1].children.push(item);
        } else if (item.value === 4) {
            list[1].children.forEach((path, i) => {
                if (path.id === item.parId) {
                    list[1].children[i].children.push(item);
                }
            })
        } else if (item.value === 5) {
            list[1].children.forEach((path, i) => {
                path.children.forEach((layer, j) => {
                    if (layer.id === item.parId) {
                        list[1].children[i].children[j].children.push(item);
                        return;
                    }
                })
            })
        }
        this.save(list);
    },
    delete(data) {
        let paths = this.fetch();
        if (data.parId === '2') {
            paths[1].children.forEach((path2, j) => {
                if (path2.id === data.id) {
                    paths[1].children.splice(j, 1);
                }
            });
        } else if (data.value === 4) {
            paths[1].children.forEach((path, i) => {
                if (path.id === data.parId) {
                    path.children.forEach((path2, j) => {
                        if (path2.id === data.id) {
                            paths[1].children[i].children.splice(j, 1);
                        }
                    })
                }
            });
        } else if (data.value === 5) {
            paths[1].children.forEach((path, i) => {
                path.children.forEach((path2, j) => {
                    if (path2.id === data.parId) {
                        path2.children.forEach((path3, z) => {
                            if (path3.id === data.id) {
                                paths[1].children[i].children[j].children.splice(z, 1);
                                return;
                            }
                        })
                    }
                })
            });
        }
        this.save(paths);
    },
    update(item) {
        let items = this.fetch();
        if (item.parId === '2'){
            items[1].children.forEach((path, i) => {
                if (path.id = item.id){
                    items[1].children.splice(i, 1, item);
                }
            });
        } else if (item.value === 4) {
            items[1].children.forEach((path, i) => {
                if (path.id === item.parId) {
                    path.children.forEach((path2, j) => {
                        if (path2.id === item.id) {
                            items[1].children[i].children.splice(j, 1, item);
                        }
                    })
                }
            })
        } else if (item.value === 5) {
            items[1].children.forEach((path, i) => {
                path.children.forEach((path2, j) => {
                    if (path2.id === item.parId) {
                        path2.children.forEach((path3, z) => {
                            if (item.id === path3.id) {
                                items[1].children[i].children[j].children.splice(z, 1, item);
                            }
                        })
                    }
                })
            })
        }
        this.save(items);
    },
    getById(id) {
        let items = this.fetch();
        return recursion(items, id);
    },
}

