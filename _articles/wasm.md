---
layout: article
title: WASM Fun
---

Hrátky s WASM. Ruby, PostgreSQL. Aneb REPL rovnou v prohlížeči k vyzkoušení. Pozor. Těžké na JS. Chvilku se bude stahovat a kompilovat.

## Ruby "Terminál" s XTerm.js

Jednoduchý příklad s použitím [xterm.js](https://github.com/xtermjs/xterm.js) a [Ruby WASM WASI](https://github.com/ruby/ruby.wasm/blob/main/docs/cheat_sheet.md). Žádné složitosti. Nic chytrého. A obecně prostě nic moc. Standard output je v konzoli.

{% include ruby_repl.html %}

Tož.. stále to není IRB.

## Ruby "Editor" s CodeMirror

A nebo můžeme zkusit editor, kde si v klidu něco napíšeme a až budeme hotovi, tak to spustíme. Používá se [CodeMirror v5](https://codemirror.net/5) a opět [Ruby WASM WASI](https://github.com/ruby/ruby.wasm/blob/main/docs/cheat_sheet.md).

{% include ruby_editor.html container_id="just-editor" height="400px" %}

## PostgreSQL REPL s PGLite

Řešení čistě od [PGLite](https://pglite.dev/) a jejich [REPL](https://pglite.dev/docs/repl). Zajímavé je, že je dodáno jako "WebComponent" a interně se používá [CodeMirror](https://codemirror.net/).

{% include pg_repl.html height="400px" %}

## Floater

Aby toho nebylo málo. V rohu by měla koukat "kartička". A v ní jedno z předchozích řešení, ale ve "vytahovacím" kontejneru.

{% include floater.html content="ruby" %}

<style>
  body {
    overflow-x: hidden;
  }
</style>
