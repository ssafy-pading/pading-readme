package site.paircoding.paircoding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Table(name = "`group`")
public class Group extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Setter
  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private Integer capacity;

  @Builder
  public Group(Integer id, String name, Integer capacity) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
  }
}
