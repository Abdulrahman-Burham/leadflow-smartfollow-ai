
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("D:/learn/micro mind/YourApp/leadflow_voiceover.wav")
$synth.Speak("Welcome to LeadFlow AI WhatsApp Pro CRM demo. Here is the sales dashboard with active pipeline analytics and deal health scores. Next, in SmartFollow AI, we trigger one click WhatsApp escalation for high value leads at risk. In Settings, we connect live LLM models including Groq Allam Arabic AI and Google Gemini. Finally, in Automations Hub, we manage 14 day automated drip sequences.")
$synth.Dispose()
