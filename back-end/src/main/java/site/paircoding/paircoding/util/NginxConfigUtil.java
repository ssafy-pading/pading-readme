package site.paircoding.paircoding.util;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import java.io.ByteArrayOutputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NginxConfigUtil {

  @Value("${ssh.nginx-server.host}")
  private String SSH_HOST;

  @Value("${ssh.nginx-server.port}")
  private int SSH_PORT;

  @Value("${ssh.nginx-server.user}")
  private String SSH_USER;

  @Value("${ssh.nginx-server.password}")
  private String SSH_PASSWORD;

  private static final String NGINX_AVAILABLE_PATH = "/etc/nginx/sites-available/";
  private static final String NGINX_ENABLED_PATH = "/etc/nginx/sites-enabled/";

  public void deleteSubdomain(String subdomain) {
    Session session = null;

    String configFileName = subdomain + ".conf"; // Nginx 설정 파일명 변환
    String configFilePath = NGINX_AVAILABLE_PATH + configFileName;

    try {
      // SSH 연결
      JSch jsch = new JSch();
      session = jsch.getSession(SSH_USER, SSH_HOST, SSH_PORT);
      session.setPassword(SSH_PASSWORD);
      session.setConfig("StrictHostKeyChecking", "no");
      session.connect();

      // 설정 파일 삭제
      String createConfigCommand = "rm " + configFilePath;
      executeCommand(session, createConfigCommand);

      // 심볼릭 링크 삭제
      String linkCommand = "rm " + NGINX_ENABLED_PATH + configFileName;
      executeCommand(session, linkCommand);

      // Nginx 재시작
      String reloadNginxCommand = "sudo nginx -s reload";
      executeCommand(session, reloadNginxCommand);

    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      if (session != null) {
        session.disconnect();
      }
    }
  }

  public void createSubdomain(String subdomain, int nodePort) {
    Session session = null;

    String configFileName = subdomain + ".conf"; // Nginx 설정 파일명 변환
    String configFilePath = NGINX_AVAILABLE_PATH + configFileName;
    String configContent = generateNginxConfig(subdomain, nodePort);

    try {
      // SSH 연결
      JSch jsch = new JSch();
      session = jsch.getSession(SSH_USER, SSH_HOST, SSH_PORT);
      session.setPassword(SSH_PASSWORD);
      session.setConfig("StrictHostKeyChecking", "no");
      session.connect();

      // 설정 파일 생성
      String createConfigCommand = "echo '" + configContent + "' > " + configFilePath;
      executeCommand(session, createConfigCommand);

      // 심볼릭 링크 생성
      String linkCommand = "ln -s " + configFilePath + " " + NGINX_ENABLED_PATH + configFileName;
      executeCommand(session, linkCommand);

      // Nginx 재시작
      String reloadNginxCommand = "sudo nginx -s reload";
      executeCommand(session, reloadNginxCommand);

    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      if (session != null) {
        session.disconnect();
      }
    }
  }

  private String generateNginxConfig(String subdomain, int nodePort) {
    return """
        server {
            listen 80;
            server_name %s.pair-coding.site;
        
            location / {
                return 301 https://$host$request_uri;  # HTTP에서 HTTPS로 리다이렉트
            }
        }
        
        server {
            listen 443 ssl;
            server_name %s.pair-coding.site;
        
            ssl_certificate /etc/letsencrypt/live/pair-coding.site/fullchain.pem;
            ssl_certificate_key /etc/letsencrypt/live/pair-coding.site/privkey.pem;
        
            include /etc/letsencrypt/options-ssl-nginx.conf;  # managed by Certbot
            ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;    # managed by Certbot
        
            client_max_body_size 100M;
        
            location / {
                proxy_pass http://192.168.0.38:%d;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        
        """.formatted(subdomain, subdomain, nodePort);
  }

  private void executeCommand(Session session, String command) throws Exception {

    ChannelExec channel = (ChannelExec) session.openChannel("exec");
    channel.setCommand(command);
    channel.setInputStream(null);
    channel.setErrStream(System.err);

    ByteArrayOutputStream responseStream = new ByteArrayOutputStream();
    channel.setOutputStream(responseStream);

    channel.connect();

    while (!channel.isClosed()) {
      Thread.sleep(100);
    }

    channel.disconnect();
  }
}
