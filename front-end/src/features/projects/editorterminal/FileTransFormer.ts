interface EditorLanguageMapping {
    [key: string]: string;
  }
  
  const editorLanguageMapping: EditorLanguageMapping = {
    // monaco-editor의 basic-languages 기준 매핑
    // (키: 파일 확장자, 값: Monaco Editor 언어 ID)
    abap: "abap",               // .abap
    cls: "apex",                // Apex 클래스 – 일반적으로 .cls 사용
    azcli: "azcli",             // .azcli (필요 시)
    bat: "bat",                 // .bat
    c: "c",                     // .c
    mligo: "cameligo",          // Cameligo (LIGO 변종) – .mligo
    clj: "clojure",             // Clojure – .clj
    coffee: "coffeescript",     // CoffeeScript – .coffee
    cpp: "cpp",                 // C++ – .cpp
    cs: "csharp",               // C# – .cs
    csp: "csp",                 // .csp
    css: "css",                 // .css
    dart: "dart",               // .dart
    dockerfile: "dockerfile",   // Dockerfile (파일명)
    ecl: "ecl",                 // .ecl
    ex: "elixir",               // Elixir – .ex (또는 .exs)
    fs: "fsharp",               // F# – .fs (또는 .fsi)
    go: "go",                   // .go
    flow: "flow",               // .flow (필요 시)
    graphql: "graphql",         // .graphql (또는 .gql)
    hbs: "handlebars",          // Handlebars – .hbs
    hcl: "hcl",                 // .hcl
    html: "html",               // .html (또는 .htm)
    ini: "ini",                 // .ini
    json: "json",
    java: "java",               // .java
    js: "javascript",           // JavaScript – .js
    jl: "julia",                // Julia – .jl
    kt: "kotlin",               // Kotlin – .kt (또는 .kts)
    less: "less",               // .less
    lex: "lexon",               // Lexon – .lex
    lua: "lua",                 // .lua
    m3: "m3",                   // .m3
    md: "markdown",             // Markdown – .md (또는 .markdown)
    mips: "mips",               // MIPS 어셈블리 – (예: .s; 여기서는 "mips" 키 사용)
    msdax: "msdax",             // .msdax
    mysql: "mysql",             // MySQL – (필요 시 별도 구분)
    m: "objective-c",           // Objective-C – .m (또는 .mm)
    pas: "pascal",              // Pascal – .pas
    ligo: "pascaligo",          // Pascaligo – .ligo (Cameligo는 위에서 .mligo)
    pl: "perl",                 // Perl – .pl (또는 .pm)
    pgsql: "pgsql",             // PostgreSQL – .pgsql
    php: "php",                 // PHP – .php
    txt: "plaintext",           // Plain text – .txt
    postiats: "postiats",       // Postiats – (필요 시)
    pq: "powerquery",           // Power Query – .pq
    ps1: "powershell",          // PowerShell – .ps1
    proto: "protobuf",          // Protocol Buffers – .proto
    pug: "pug",                 // Pug – .pug
    py: "python",               // Python – .py
    qs: "qsharp",               // Q# – .qs
    r: "r",                     // R – .r
    cshtml: "razor",            // Razor – .cshtml
    redis: "redis",             // Redis – (필요 시)
    redshift: "redshift",       // Redshift – (필요 시)
    rst: "restructuredtext",    // reStructuredText – .rst
    rb: "ruby",                 // Ruby – .rb
    rs: "rust",                 // Rust – .rs
    sb: "sb",                   // SB – (정의에 따름)
    scala: "scala",             // Scala – .scala
    scm: "scheme",              // Scheme – .scm
    scss: "scss",               // SCSS – .scss
    sh: "shell",                // Shell script – .sh
    sol: "solidity",            // Solidity – .sol
    sophia: "sophia",           // Sophia – .sophia
    sql: "sql",                 // SQL – .sql
    st: "st",                   // Structured Text – .st
    swift: "swift",             // Swift – .swift
    sv: "systemverilog",        // SystemVerilog – .sv
    tcl: "tcl",                 // Tcl – .tcl
    twig: "twig",               // Twig – .twig
    ts: "typescript",           // TypeScript – .ts (TSX는 별도 처리 가능)
    vb: "vb",                   // Visual Basic – .vb
    xml: "xml",                 // XML – .xml
    yaml: "yaml",               // YAML – .yaml
    yml: "yaml"                 // YAML – .yml
  };
  
  const fileTransformer = (fileName: string): string => {
    if (!fileName) return "plaintext";
  
    const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
    return editorLanguageMapping[extension] || "plaintext";
  };
  
  export default fileTransformer;
  