#!/usr/bin/env node

/**
 * Add Trusted User Script
 * This script helps you add trusted users to the access control system
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Add Trusted User to Credit Repair App');
console.log('==========================================\n');

// Get user input
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function addTrustedUser() {
  try {
    console.log('Please provide the following information:\n');
    
    const email = await askQuestion('Email address: ');
    const name = await askQuestion('Full name: ');
    
    console.log('\nSelect role:');
    console.log('1. Beta User (Basic access)');
    console.log('2. Tester (Advanced access)');
    console.log('3. Admin (Full access)');
    
    const roleChoice = await askQuestion('Role (1-3): ');
    const roleMap = {
      '1': 'beta',
      '2': 'tester', 
      '3': 'admin'
    };
    const role = roleMap[roleChoice] || 'beta';
    
    const accessLevel = role === 'admin' ? 3 : role === 'tester' ? 2 : 1;
    
    // Read current access control file
    const accessControlPath = path.join(process.cwd(), 'lib', 'access-control.ts');
    let content = fs.readFileSync(accessControlPath, 'utf8');
    
    // Find the TRUSTED_USERS array
    const usersArrayMatch = content.match(/export const TRUSTED_USERS: TrustedUser\[\] = \[([\s\S]*?)\];/);
    
    if (!usersArrayMatch) {
      throw new Error('Could not find TRUSTED_USERS array in access-control.ts');
    }
    
    // Create new user object
    const newUser = {
      id: `trusted-user-${Date.now()}`,
      email: email.toLowerCase(),
      name: name,
      role: role,
      accessLevel: accessLevel,
      addedAt: new Date().toISOString(),
      addedBy: 'script',
      isActive: true
    };
    
    // Format the new user for insertion
    const newUserString = `  {
    id: '${newUser.id}',
    email: '${newUser.email}',
    name: '${newUser.name}',
    role: '${newUser.role}',
    accessLevel: ${newUser.accessLevel},
    addedAt: '${newUser.addedAt}',
    addedBy: '${newUser.addedBy}',
    isActive: true
  }`;
    
    // Insert the new user before the closing bracket
    const updatedContent = content.replace(
      /(\s+)(\]);/,
      `$1${newUserString},$1$2`
    );
    
    // Write the updated content back
    fs.writeFileSync(accessControlPath, updatedContent);
    
    console.log('\n✅ User added successfully!');
    console.log('============================');
    console.log(`Email: ${newUser.email}`);
    console.log(`Name: ${newUser.name}`);
    console.log(`Role: ${newUser.role}`);
    console.log(`Access Level: ${accessLevel}`);
    console.log(`ID: ${newUser.id}`);
    
    console.log('\n🔄 Next steps:');
    console.log('1. Restart your development server (npm run dev)');
    console.log('2. Test login with the new email address');
    console.log('3. Verify the user can access the dashboard');
    
  } catch (error) {
    console.error('\n❌ Error adding user:', error.message);
    console.log('\n🔧 Manual steps:');
    console.log('1. Open lib/access-control.ts');
    console.log('2. Add the user to the TRUSTED_USERS array');
    console.log('3. Restart your development server');
  } finally {
    rl.close();
  }
}

addTrustedUser();
