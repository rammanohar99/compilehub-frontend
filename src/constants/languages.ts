import type { Language } from '../types';

export const LANGUAGES: Language[] = [
  {
    id: 71,
    name: 'Python 3',
    monacoId: 'python',
    defaultCode: `# Read input
# Write your solution here
print()
`,
  },
  {
    id: 63,
    name: 'JavaScript',
    monacoId: 'javascript',
    defaultCode: `// Read from stdin, write to stdout
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');

// Write your solution here
console.log();
`,
  },
  {
    id: 54,
    name: 'C++',
    monacoId: 'cpp',
    defaultCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your solution here

    return 0;
}
`,
  },
  {
    id: 62,
    name: 'Java',
    monacoId: 'java',
    defaultCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        // Write your solution here

    }
}
`,
  },
  {
    id: 50,
    name: 'C',
    monacoId: 'c',
    defaultCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your solution here

    return 0;
}
`,
  },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];

export const LANGUAGE_MAP: Record<number, Language> = Object.fromEntries(
  LANGUAGES.map((l) => [l.id, l])
);
