import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '..');
const projectRoot = path.resolve(srcDir, '..', '..');

test('Firebase SDK v10+ Modular Compliance: No legacy v8/v9 compat methods in source files', () => {
  const scanFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('dist')) {
          results = results.concat(scanFiles(filePath));
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(filePath);
      }
    });
    return results;
  };

  const jsFiles = scanFiles(srcDir);
  assert.ok(jsFiles.length > 5, 'Found source files to inspect');

  const legacyPatterns = [
    /firebase\/compat/,
    /firebase\.firestore\(\)/,
    /firebase\.firestore\.FieldValue/,
    /db\.collection\(/
  ];

  for (const filePath of jsFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const pattern of legacyPatterns) {
      const match = content.match(pattern);
      assert.strictEqual(
        match,
        null,
        `Prohibited legacy pattern ${pattern} found in ${path.relative(projectRoot, filePath)}`
      );
    }
  }
});

test('React Context Lifecycle Safety: CommunityContext returns unsubscribe cleanup handlers', () => {
  const contextPath = path.join(srcDir, 'context', 'CommunityContext.jsx');
  assert.ok(fs.existsSync(contextPath), 'CommunityContext.jsx exists');

  const content = fs.readFileSync(contextPath, 'utf-8');
  assert.match(
    content,
    /return\s*\(\)\s*=>\s*\{\s*if\s*\(typeof\s+unsubscribe/,
    'CommunityContext must return unsubscribe cleanup function to prevent memory leaks'
  );
  assert.match(
    content,
    /subscribeTickets\(/,
    'CommunityContext must wire subscribeTickets'
  );
  assert.match(
    content,
    /subscribeCommunities\(/,
    'CommunityContext must wire subscribeCommunities'
  );
  assert.match(
    content,
    /subscribeChallenges\(/,
    'CommunityContext must wire subscribeChallenges'
  );
});

test('Anti-Slop Spring Physics: TicketCard spring parameters comply with motion guidelines', async () => {
  const ticketCardPath = path.join(srcDir, 'components', 'TicketCard.jsx');
  assert.ok(fs.existsSync(ticketCardPath), 'TicketCard.jsx exists');

  const content = fs.readFileSync(ticketCardPath, 'utf-8');
  assert.match(content, /from ['"]motion\/react['"]/, 'Imports motion from motion/react');
  assert.match(content, /stiffness:\s*350/, 'Spring stiffness is 350');
  assert.match(content, /damping:\s*25/, 'Spring damping is 25');
  assert.match(content, /mass:\s*0\.8/, 'Spring mass is 0.8');
  assert.match(content, /whileHover=\{\{\s*scale:\s*1\.015,\s*y:\s*-2\s*\}\}/, 'Tactile hover spring configured');
});

test('Cloud Firestore Security Rules: firestore.rules exists and validates community isolation', () => {
  const rulesPath = path.join(projectRoot, 'firestore.rules');
  assert.ok(fs.existsSync(rulesPath), 'firestore.rules must exist at project root');

  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
  assert.match(rulesContent, /rules_version\s*=\s*'2';/, 'Specifies rules_version 2');
  assert.match(rulesContent, /request\.auth\s*!=\s*null/, 'Requires authenticated access');
  assert.match(rulesContent, /isWingRep\(resource\.data\.community_id,\s*resource\.data\.wing\)/, 'Role-based Wing Rep verification');
  assert.match(rulesContent, /match\s+\/tickets\/\{ticketId\}/, 'Secures tickets collection');
});

test('Tooling Configuration: CodeRabbit and GSD configurations exist', () => {
  const coderabbitYaml = path.join(projectRoot, '.coderabbit.yaml');
  const coderabbitWorkflow = path.join(projectRoot, '.github', 'workflows', 'coderabbit.yml');
  const coderabbitSkill = path.join(projectRoot, '.agents', 'skills', 'coderabbit', 'SKILL.md');
  const gsdAgentDir = path.join(projectRoot, '.agent');

  assert.ok(fs.existsSync(coderabbitYaml), '.coderabbit.yaml exists');
  assert.ok(fs.existsSync(coderabbitWorkflow), '.github/workflows/coderabbit.yml exists');
  assert.ok(fs.existsSync(coderabbitSkill), '.agents/skills/coderabbit/SKILL.md exists');
  assert.ok(fs.existsSync(gsdAgentDir), 'GSD framework is installed in .agent');
});
