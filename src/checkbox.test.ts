import { describe, it, expect } from 'vitest';

// Simple logic test for the checkbox conversion used in the Toolbar
function convertToTaskList(text: string): string {
  return text.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return line;
    if (/^[-*]\s\[[ x-]\]/.test(trimmed)) return line;
    return `- [ ] ${trimmed}`;
  }).join('\n');
}

describe('Luma Checkbox Logic', () => {
  it('should convert plain text to checkbox list', () => {
    const input = "Aufgabe A\nAufgabe B";
    const expected = "- [ ] Aufgabe A\n- [ ] Aufgabe B";
    expect(convertToTaskList(input)).toBe(expected);
  });

  it('should not double-wrap existing checkboxes', () => {
    const input = "- [ ] Aufgabe A\n- [x] Aufgabe B";
    expect(convertToTaskList(input)).toBe(input);
  });

  it('should handle GFM pending state correctly', () => {
    const input = "- [-] Aufgabe C";
    expect(convertToTaskList(input)).toBe(input);
  });

  it('should handle asterisks as list markers', () => {
    const input = "* [ ] Aufgabe D";
    expect(convertToTaskList(input)).toBe(input);
  });
});
