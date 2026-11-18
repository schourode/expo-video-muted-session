import AVFoundation
import ExpoModulesCore

public class SessionProbeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SessionProbe")

    Function("getSessionState") { () -> [String: String] in
      let session = AVAudioSession.sharedInstance()
      return [
        "category": session.category.rawValue,
        "mode": session.mode.rawValue,
        "options": String(session.categoryOptions.rawValue),
        "otherAudioPlaying": String(session.isOtherAudioPlaying)
      ]
    }
  }
}
