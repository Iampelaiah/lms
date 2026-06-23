const fs = require('fs');
const file = 'src/app/tutor/students/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Normalize line endings to \n just for simpler regex/searching
content = content.replace(/\r\n/g, '\n');

// Find the return statement
const returnIndex = content.indexOf('return (\n    <div className="flex flex-col h-full bg-background');
if (returnIndex === -1) throw new Error('Return not found');

// Find the IIFE
const iifeStartStr = '              {/* Chat UI Extracted for reuse in Video mode */}\n              {(() => {\n                const chatUI = (\n                  <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-h-0">';
const iifeStart = content.indexOf(iifeStartStr);

const iifeEndStr = '{activeTab === \'messages\' && chatUI}\n\n                  {/* Subject Progress Overview */}';
const iifeEnd = content.indexOf(iifeEndStr) + iifeEndStr.length;

if (iifeStart === -1) throw new Error('IIFE Start not found');
if (iifeEnd === -1) throw new Error('IIFE End not found');

// Extract chatUI inner content
const chatUIStartStr = 'const chatUI = (\n                  <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-h-0">';
const chatUIEndStr = '</form>\n                    </div>\n                );';
const chatUIStart = content.indexOf(chatUIStartStr) + 'const chatUI = (\n'.length;
const chatUIEnd = content.indexOf(chatUIEndStr) + '</form>\n                    </div>'.length;

const chatUIInner = content.substring(chatUIStart, chatUIEnd).split('\n').map(l => l.replace(/^ {18}/, '  ')).join('\n');

const newChatUIDecl = `  const chatUI = selectedGroup && selectedStudentId ? (\n` + chatUIInner + `\n  ) : null;\n\n`;

const newLayout = `              {/* Lower Split Grid */}
              {isVideoCallActive ? (
                <div className="flex-1 flex gap-4 min-h-0 overflow-hidden mt-4">
                  <div className="flex-[2] bg-black rounded-2xl relative flex flex-col overflow-hidden shadow-2xl">
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                       <h2 className="text-white text-lg font-bold drop-shadow-md">Virtual Class with {selectedGroup.student.full_name}</h2>
                       <p className="text-white/70 text-sm drop-shadow-md">Live Session</p>
                    </div>
                    {selectedStudentId && profile?.id && (
                       <AgoraCall 
                         channelName={\`DrMax_LMS_TutorClass_\${tutorId}_\${selectedStudentId}\`} 
                         onEndCall={() => setIsVideoCallActive(false)} 
                       />
                    )}
                  </div>
                  <div className="flex-[1] flex flex-col min-h-0">
                     {chatUI}
                  </div>
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-4 min-h-0 overflow-hidden">
                  
                  {/* Left Side (Chat & Progress) */}
                  <div className="xl:col-span-3 flex flex-col gap-4 min-h-0">
                    
                    {activeTab === 'messages' && chatUI}

                  {/* Subject Progress Overview */}
`;

// Replace IIFE with new layout
content = content.substring(0, iifeStart) + newLayout.trim() + '\n' + content.substring(iifeEnd);

// Insert chatUI decl before return
content = content.substring(0, returnIndex) + newChatUIDecl + content.substring(returnIndex);

// Fix the end of the IIFE
const oldEnd = `                </div>
              </div>
              );
            })()}
            </>`;
const newEnd = `                </div>
              </div>
            </>`;
content = content.replace(oldEnd, newEnd);

fs.writeFileSync(file, content);
console.log('Successfully refactored!');
