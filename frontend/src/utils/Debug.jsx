VITE_DEBUG = "DEBUG"

export function Debug(content){
    if (VITE_DEBUG == DEBUG) {
        console.log(content)
        return
    }
    else if (VITE_DEBUG == INFO) return
}