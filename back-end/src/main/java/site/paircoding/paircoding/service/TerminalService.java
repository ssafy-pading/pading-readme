package site.paircoding.paircoding.service;

import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.dsl.ExecListener;
import io.fabric8.kubernetes.client.dsl.ExecWatch;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.Project;

@Service
@RequiredArgsConstructor
public class TerminalService {

  @Value("${kubernetes.namespace}")
  private String namespace;

  private final Map<String, TerminalBridge> bridges = new ConcurrentHashMap<>();
  private final KubernetesClient kubernetesClient;
  private final SimpMessagingTemplate messagingTemplate;
  private final ProjectService projectService;

  public void connectToPod(Integer groupId, Integer projectId, String terminalId,
      String destination)
      throws Exception {

    Project project = projectService.getProject(groupId, projectId);
    String podName = project.getContainerId();

    ExecWatch execWatch = kubernetesClient.pods()
        .inNamespace(namespace)
        .withName(podName)
        .redirectingInput()
        .redirectingOutput()
        .redirectingError()
        .withTTY()
        .usingListener(new ExecListener() {
          @Override
          public void onOpen() {
            System.out.println("Connection opened");
          }

          @Override
          public void onFailure(Throwable t, Response failureResponse) {
            messagingTemplate.convertAndSend(destination,
                "Connection failed: " + t.getMessage());
            System.out.println("Connection failure");
            bridges.remove(terminalId);
          }

          @Override
          public void onClose(int code, String reason) {
            System.out.println("Connection closed");
            bridges.remove(terminalId);
          }
        })
        .exec("sh", "-c",
            "cd /app && TERM=xterm-256color; export TERM; [ -x /bin/bash ] && /bin/bash || /bin/sh");

    TerminalBridge bridge = new TerminalBridge(execWatch, terminalId, destination);
    bridges.put(terminalId, bridge);
    bridge.start();
  }

  public void handleInput(String terminalId, String input) {
    TerminalBridge bridge = bridges.get(terminalId);
    if (bridge != null) {
      bridge.sendInput(input);
    }
  }

  public void handleResize(String terminalId, Map<?, ?> resize) {
    TerminalBridge bridge = bridges.get(terminalId);
    if (bridge != null) {
      bridge.resize((int) resize.get("cols"), (int) resize.get("rows"));
    }
  }


  private class TerminalBridge {

    private final ExecWatch execWatch;
    private final String terminalId;
    private final OutputStream inputStream;
    private final String destination;

    public TerminalBridge(ExecWatch execWatch, String terminalId, String destination) {
      this.execWatch = execWatch;
      this.terminalId = terminalId;
      this.inputStream = execWatch.getInput();
      this.destination = destination;
    }

    public void start() {
      startAsyncReader(execWatch.getOutput(), "OUTPUT");
      startAsyncReader(execWatch.getError(), "ERROR");
    }

    private void startAsyncReader(InputStream stream, String type) {
      new Thread(() -> {
        byte[] buffer = new byte[1024];
        try {
          int bytesRead;
          while ((bytesRead = stream.read(buffer)) != -1) {
            String content = new String(buffer, 0, bytesRead, StandardCharsets.UTF_8);
            messagingTemplate.convertAndSend(destination, content);
          }
        } catch (IOException e) {
          messagingTemplate.convertAndSend(destination,
              "\n[" + type + " READ ERROR] " + e.getMessage());
        }
      }).start();
    }

    public synchronized void sendInput(String input) {
      try {
        inputStream.write(input.getBytes(StandardCharsets.UTF_8));
        inputStream.flush();
      } catch (IOException e) {
        messagingTemplate.convertAndSend(destination,
            "\n[INPUT WRITE ERROR] " + e.getMessage());
      }
    }

    public synchronized void resize(int cols, int rows) {
      try {
        execWatch.resize(cols, rows);
      } catch (Exception e) {
        messagingTemplate.convertAndSend(destination,
            "\n[RESIZE ERROR] " + e.getMessage());
      }
    }
  }
}

