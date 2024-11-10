package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"
	"strings"
)

// Employee 構造体
type Employee struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
}

// 画像ファイルを検索してJavaScriptを生成
func generateEmployeesJS(w http.ResponseWriter, r *http.Request) {
	files, err := ioutil.ReadDir("images")
	if err != nil {
		http.Error(w, "画像フォルダの読み込みに失敗しました", http.StatusInternalServerError)
		return
	}

	var employees []Employee
	id := 1

	for _, file := range files {
		// 画像ファイルのみを処理
		if !file.IsDir() && isImageFile(file.Name()) {
			employee := Employee{
				ID:    id,
				Name:  strings.TrimSuffix(file.Name(), filepath.Ext(file.Name())), // 拡張子を除いたファイル名
				Image: "images/" + file.Name(),
			}
			employees = append(employees, employee)
			id++
		}
	}

	// JavaScript形式で出力
	w.Header().Set("Content-Type", "application/javascript")
	fmt.Fprintf(w, "const employees = %s;", toJSON(employees))
}

// 画像ファイルかどうかをチェック
func isImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif"
}

// JSONに変換
func toJSON(v interface{}) string {
	bytes, err := json.MarshalIndent(v, "", "    ")
	if err != nil {
		return "[]"
	}
	return string(bytes)
}

func main() {
	// 静的ファイル用のハンドラ
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	// 動的なdata.js用のハンドラ
	http.HandleFunc("/data.js", generateEmployeesJS)

	log.Println("Starting server at http://localhost:8000")
	if err := http.ListenAndServe(":8000", nil); err != nil {
		log.Fatal(err)
	}
}
